# Recassfov

**Re**act **C**lient **a**nd **S**erver **S**ide **Fo**rm **V**alidation.

## Usage

Install library.

```sh
# with yarn
$ yarn add Recassfov

# or with npm
$ npm i Recassfov
```

Import library.

```jsx
import { Form, Input } from 'Recassfov'
```

Create validation rules. ([Validator.js](https://github.com/chriso/validator.js#validators))

```jsx
const validations = {
  username: [
    {
      rule: 'isLength',
      args: { min: 4, max: 32 },
      invalidFeedback: 'please provide a username (min: 4, max: 32)'
    }
  ],
  email: [
    {
      rule: 'isEmail',
      invalidFeedback: 'please provide a valid email'
    }
  ],
  message: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'please provide a message'
    }
  ]
}
```

Build your form.

```jsx
<Form postUrl='http://site.com/post'>
  <div>
    <Input
      type='text'
      name='username'
      placeholder='username'
      validations={validations.username}
      />
  </div>

  <div>
    <Input
      type='email'
      name='email'
      placeholder='email'
      validations={validations.email}
      />
  </div>

  <div>
    <Textarea
      name='message'
      placeholder='message'
      validations={validations.message}
      />
  </div>

  <div>
    <input type='submit' value='submit' />
  </div>
</Form>
```

Add `.is-invalid` and `.invalid-feedback` classes into your CSS.

```css
.is-invalid {
  border: 1px solid #dc3545;
}
.invalid-feedback {
  display: none;
  color: #dc3545;
}
.is-invalid~.invalid-feedback {
  display: block;
}
```

Make sure you add the errors to the `validations` object in backend.

```js
app.post('/signup', (req, res) => {
  const result = {
    validations: {}
  }

  if (req.body.username === 'john') {
    result.validations.username = 'john is already registered'
  }

  res.send(result)
})
```

## Props & Callbacks

**`<Form>`**

Props

```jsx
<Form
  postUrl='http://site.com.post'
  headers={{
    'Content-Type': 'application/json'
  }}
  classNames={{
    invalidInput: 'is-invalid',
    invalidFeedback: 'invalid-feedback'
  }}
  >
```

Callbacks

```jsx
<Form
  onSubmit={() => {
    console.log('onSubmit')
  }}
  validFormBeforePost={(res) => {
    console.log(res.formItems)
  }}
  invalidFormBeforePost={(res) => {
    console.log(res.formItems)
  }}
  validFormAfterPost={(res) => {
    console.log(res.formItems)
    console.log(res.ajaxResult)
    res.cleanFormItems()
  }}
  invalidFormAfterPost={(res) => {
    console.log(res.formItems)
    console.log(res.ajaxResult)
  }}
  >
```
