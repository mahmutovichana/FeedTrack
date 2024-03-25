// AUTH routes
/**
 * @swagger
 * /api/token:
 *  post:
 *    summary: Refresh JWT access token
 *    description: Get a new access token by passing refresh token in the request body
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *            example:
 *              refreshToken: eyJhbGciOi...sOeF7OuJMZs
 *    responses:
 *      "200":
 *        description: New access token
 *        content:
 *          application/json:
 *            schema:
 *              accessToken:
 *                type: string
 *            example:
 *              accessToken: eyJhbGciOi...sOeF7OuJMZs
 *      "401":
 *        description: Not authenticated
 *      "403":
 *        description: Invalid refresh token
 */

/**
 * @swagger
 * /api/login:
 *  post:
 *    summary: User login
 *    description: Get new access and refresh tokens for successful login
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *            example:
 *              email: example@etf.unsa.ba
 *              password: pass123
 *    responses:
 *      "200":
 *        description: Logged in successfully
 *        content:
 *          application/json:
 *            schema:
 *              id:
 *                type: number
 *              username:
 *                type: string
 *              email:
 *                type: string
 *              accessToken:
 *                type: string
 *              refreshToken:
 *                type: string
 *            example:
 *              id: 1
 *              username: user123
 *              email: example@etf.unsa.ba
 *              accessToken: eyJhbGciOi...sOeF7OuJMZs
 *              refreshToken: asdsadsad...sOeF7asduJMZs
 *      "400":
 *        description: Incorrect email or password
 */

/**
 * @swagger
 * /api/logout:
 *  post:
 *    summary: User logout
 *    description: Logout current user by providing access token in the request body
 *    requestBody:
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
 *                type: string
 *            example:
 *              refreshToken: eyJhbGciOi...sOeF7OuJMZs
 *    responses:
 *      "200":
 *        description: Logged out successfully
 *      "401":
 *        description: Invalid refresh token
 *      "403":
 *        description: Not authenticated
 */

// USER routes
/**
 * @swagger
 * /api/dashboard:
 *  get:
 *    summary: User dashboard
 *    description: Authenticated users can view the dashboard
 *    parameters:
 *    - in: header
 *      name: authorization
 *      schema:
 *        properties:
 *        authorization:
 *          type: string
 *        required: true
 *      description: Access token for user that's logged in
 *      example:
 *        authorization: Bearer eyJhbGciOi...sOeF7OuJMZs
 *    responses:
 *      "200":
 *        description: A successful response
 *      "401":
 *        description: Not authenticated
 *      "403":
 *        description: Invalid refresh token
 */
