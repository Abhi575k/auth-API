# Enhanced Authentication API

## Tech Used:

- Node.js
- MongoDB
- Redis
- Json Web Token

## API calls

### Auth Routes

- /api/register: registering a new user.
```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
    "name": "admin",
    "email": "admin@gmail.com",
    "password": "admin5"
}
```
Returns ```accessToken``` and ```refreshToken``` used for mantaining session and restricting user.

- /api/login: logging in a user.
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
    "email": "admin@gmail.com",
    "password": "admin5"
}
```
Returns ```accessToken``` and ```refreshToken``` used for mantaining session and restricting user.

- /api/refresh-token: getting a new ```accessToken``` after the previous token expires.
```
POST http://localhost:3000/auth/refresh-token
Content-Type: application/json

{
    "refreshToken": "<refreshToken>"
}
```
Returns a new ```accessToken```.

- /api/logout: logging out the user.
```
DELETE http://localhost:3000/auth/logout
Authorization: bearer <accessToken>

{
    "refreshToken": "refreshToken"
}
```
Deletes the ```refreshToken``` from redis database and blacklists the ```accessToken``` until expiry(blacklisting not implemented).

- /api/logout: logging out the user.
```
DELETE http://localhost:3000/auth/logout
Authorization: bearer <accessToken>

{
    "refreshToken": "refreshToken"
}
```
Deletes the ```refreshToken``` from redis database and blacklists the ```accessToken``` until expiry(blacklisting not implemented).

### Profile Routes

- /profile:
    - for admin: lists all the profiles on the server.
    - for user: lists all the public profiles on the server.

```
GET http://localhost:3000/profile
Authorization: Bearer <accessToken>
```

- /profile/view: view your profile
```
GET http://localhost:3000/profile/view
Authorization: Bearer <accessToken>
```

- /profile/update: user can update 'bio', 'phone', 'visibility'(public|private), 'name' and 'email'.
```
PATCH http://localhost:3000/profile/update
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "bio": "I like cats.",
    "phone": "1234567890",
    "visibility": "public",
    "name": "admin",
    "email": "admin@gmail.com"
}
```

- /profile/update/password: user can update password.
```
PATCH http://localhost:3000/profile/update/password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "oldPassword": "123456",
    "password1": "admin5",
    "password2": "admin5"
}
```

- /profile/update/photo/upload: user can upload profile photo.
```
PATCH http://localhost:3000/profile/update/photo/upload
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
    "photo": "<photo>"
}
```

- /profile/update/photo/url: user can update profile photo using url.
```
PATCH http://localhost:3000/profile/update/photo/url
Authorization: Bearer <accessToken>
Content-Type: application/json

{
    "photo": "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
}
```

- /profile/delete: user can delete his/her profile.
```
DELETE http://localhost:3000/profile/delete
Authorization: Bearer <accessToken>
```

- /profile/delete/photo: user can delete his/her profile photo.
```
DELETE http://localhost:3000/profile/delete/photo
Authorization: Bearer <accessToken>
```
### Github Routes