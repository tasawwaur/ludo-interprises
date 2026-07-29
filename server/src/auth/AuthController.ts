export class AuthController { public async login(req: any, res: any) { res.json({ token: "jwt_token" }); } }
