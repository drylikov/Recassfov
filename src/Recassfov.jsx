import React from 'react'
import validator from 'validator'
import axios from 'axios'

import objectToUrlEncoded from './objectToUrlEncoded'

const Context = React.createContext()

class Provider extends React.Component {
  constructor () {
    super()
    this.state = {
      formItems: {},
      totalValidations: 0,
      classNames: {
        invalidInput: 'is-invalid',
        invalidFeedback: 'invalid-feedback'
      }
    }
  }

  setClassNames (classNames) {
    this.setState({ classNames })
  }

  setFormItem (item, firstTime) {
    const formItems = this.state.formItems

    formItems[item.name] = {
      value: item.value || '',
      validations: item.validations || [],
      invalidFeedback: item.validations ? item.validations[0].invalidFeedback : '',
      className: ''
    }

    this.setState({ formItems })

    if (firstTime) {
      this.setState((prevState) => ({
        totalValidations: prevState.totalValidations + (item.validations ? item.validations.length : 0)
      }))
    }
  }

  cleanFormItems () {
    const formItems = this.state.formItems

    Object.keys(formItems).map((item) => {
      formItems[item].value = ''
    })

    this.setState({ formItems })
  }

  handleInput (onChange, e) {
    if (onChange) onChange(e)

    const item = e.target
    const formItems = this.state.formItems

    if (item.type === 'checkbox') {
      formItems[item.name].value = !formItems[item.name].value
    } else {
      formItems[item.name].value = item.value
    }

    this.setState({ formItems })
  }

  validateFormItems () {
    const formItems = this.state.formItems
    let formItemsValues = {}
    let howManyOfFormItemsAreValidated = 0

    Object.keys(formItems).map((itemName) => {
      const item = formItems[itemName]
      formItemsValues[itemName] = item.value
      const validationsLength = item.validations.length
      let validated = 0

      for (let i = 0; i < validationsLength; i++) {
        const validation = item.validations[i]
        const validate = validator[validation.rule](item.value, validation.args)

        if (validate) {
          validated++
          howManyOfFormItemsAreValidated++
        }

        item.className = validationsLength === validated ? '' : ` ${this.state.classNames.invalidInput}`

        if (!validate) {
          item.invalidFeedback = validation.invalidFeedback
          continue
        }
      }
    })

    this.setState({ formItems })

    const result = {}
    result.success = howManyOfFormItemsAreValidated === this.state.totalValidations
    result.formItemsValues = formItemsValues

    return result
  }

  onSubmit (
    onSubmit,
    validFormBeforePost,
    invalidFormBeforePost,
    validFormAfterPost,
    invalidFormAfterPost,
    postUrl,
    headers,
    e
  ) {
    e.preventDefault()

    if (onSubmit) onSubmit(e)

    const validateFormItems = this.validateFormItems()
    const formItems = this.state.formItems

    if (validateFormItems.success) {
      if (validFormBeforePost) {
        validFormBeforePost({
          formItems: validateFormItems.formItemsValues
        })
      }

      if (postUrl) {
        const _formItems = Object.keys(formItems).reduce((previous, current) => {
          previous[current] = formItems[current].value
          return previous
        }, {})

        headers = typeof headers === 'object' ? headers : {}
        headers['Content-Type'] = headers.hasOwnProperty('Content-Type') ? headers['Content-Type'] : 'application/x-www-form-urlencoded'
        const data = headers['Content-Type'] === 'application/x-www-form-urlencoded' ? objectToUrlEncoded(_formItems) : _formItems

        axios({
          url: postUrl,
          method: 'post',
          data,
          headers
        })
          .then((res) => {
            const validations = res.data.validations || {}

            if (Object.keys(validations).length) {
              if (invalidFormAfterPost) {
                invalidFormAfterPost({
                  formItems: validateFormItems.formItemsValues,
                  ajaxResult: res.data
                })
              }

              Object.keys(validations).map((itemName) => {
                formItems[itemName].invalidFeedback = validations[itemName]
                formItems[itemName].className = ` ${this.state.classNames.invalidInput}`
              })

              this.setState({ formItems })
            } else {
              if (validFormAfterPost) {
                validFormAfterPost({
                  formItems: validateFormItems.formItemsValues,
                  ajaxResult: res.data,
                  cleanFormItems: this.cleanFormItems.bind(this)
                })
              }
            }
          })
          .catch((err) => {
            console.log(err)
          })
      }
    } else {
      if (invalidFormBeforePost) {
        invalidFormBeforePost({
          formItems: validateFormItems.formItemsValues
        })
      }
    }
  }

  render () {
    const store = {
      state: this.state,
      setClassNames: this.setClassNames.bind(this),
      setFormItem: this.setFormItem.bind(this),
      handleInput: this.handleInput.bind(this),
      onSubmit: this.onSubmit.bind(this)
    }

    return (
      <Context.Provider value={store}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

class Form extends React.Component {
  constructor (props) {
    super(props)
    if (this.props.classNames) {
      this.props.store.setClassNames(this.props.classNames)
    }
  }

  render () {
    const {
      store,
      onSubmit,
      validFormBeforePost,
      invalidFormBeforePost,
      validFormAfterPost,
      invalidFormAfterPost,
      postUrl,
      headers,
      classNames,
      ...otherProps
    } = this.props

    return (
      <form
        {...otherProps}
        noValidate
        onSubmit={
          this.props.store.onSubmit.bind(
            this,
            onSubmit,
            validFormBeforePost,
            invalidFormBeforePost,
            validFormAfterPost,
            invalidFormAfterPost,
            postUrl,
            headers
          )
        }>
        {this.props.children}
      </form>
    )
  }
}

class Input extends React.Component {
  constructor (props) {
    super(props)
    this.props.store.setFormItem(this.props, 1)
  }

  componentDidUpdate (prevProps) {
    if (this.props.value !== prevProps.value || this.props.validations !== prevProps.validations) {
      this.props.store.setFormItem(this.props)
    }
  }

  render () {
    const { store, validations, className, onChange, ...otherProps } = this.props
    const thisItem = store.state.formItems[this.props.name]

    return (
      <React.Fragment>
        <input
          {...otherProps}
          onChange={store.handleInput.bind(this, onChange)}
          className={`${className || ''}${thisItem.className}`}
          value={thisItem.value} />

        <div className={store.state.classNames.invalidFeedback}>{thisItem.invalidFeedback}</div>
      </React.Fragment>
    )
  }
}

class Textarea extends React.Component {
  constructor (props) {
    super(props)
    this.props.store.setFormItem(this.props, 1)
  }

  componentDidUpdate (prevProps) {
    if (this.props.value !== prevProps.value || this.props.validations !== prevProps.validations) {
      this.props.store.setFormItem(this.props)
    }
  }

  render () {
    const { store, validations, className, onChange, ...otherProps } = this.props
    const thisItem = store.state.formItems[this.props.name]

    return (
      <React.Fragment>
        <textarea
          {...otherProps}
          onChange={store.handleInput.bind(this, onChange)}
          className={`${className || ''}${thisItem.className}`}
          value={thisItem.value}>
          {this.props.children}
        </textarea>

        <div className={store.state.classNames.invalidFeedback}>{thisItem.invalidFeedback}</div>
      </React.Fragment>
    )
  }
}

class Select extends React.Component {
  constructor (props) {
    super(props)
    this.props.store.setFormItem(this.props, 1)
  }

  componentDidUpdate (prevProps) {
    if (this.props.value !== prevProps.value || this.props.validations !== prevProps.validations) {
      this.props.store.setFormItem(this.props)
    }
  }

  render () {
    const { store, validations, children, className, onChange, ...otherProps } = this.props
    const thisItem = store.state.formItems[this.props.name]

    return (
      <React.Fragment>
        <select
          {...otherProps}
          onChange={store.handleInput.bind(this, onChange)}
          className={`${className || ''}${thisItem.className}`}
          value={thisItem.value}>
          {children}
        </select>

        <div className={store.state.classNames.invalidFeedback}>{thisItem.invalidFeedback}</div>
      </React.Fragment>
    )
  }
}

const connectProvider = (Component) => {
  return (props) => (
    <Provider>
      <Context.Consumer>
        {(store) => <Component {...props} store={store} />}
      </Context.Consumer>
    </Provider>
  )
}

const connectConsumer = (Component) => {
  return (props) => (
    <Context.Consumer>
      {(store) => <Component {...props} store={store} />}
    </Context.Consumer>
  )
}

module.exports.Form = connectProvider(Form)
module.exports.Input = connectConsumer(Input)
module.exports.Textarea = connectConsumer(Textarea)
module.exports.Select = connectConsumer(Select)
