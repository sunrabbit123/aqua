"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
// Domain layer - pure functions
const validateUser = (0, src_1.createDomain)((userData) => {
    if (!userData.name || !userData.email) {
        throw new Error('Name and email are required');
    }
    return userData;
});
const createUserEntity = (0, src_1.createDomain)((userData) => ({
    id: Date.now(),
    name: userData.name,
    email: userData.email,
    createdAt: new Date()
}));
// Service layer - business logic functions
const userService = {
    getAll: (0, src_1.createService)(() => {
        return [
            { id: 1, name: 'John', email: 'john@example.com' },
            { id: 2, name: 'Jane', email: 'jane@example.com' }
        ];
    }),
    create: (0, src_1.createService)((userData) => {
        const validatedData = validateUser(userData);
        const user = createUserEntity(validatedData);
        return user;
    })
};
// Controller with static methods and decorators
let UserController = class UserController {
    static async getUsers(req, res) {
        const users = await userService.getAll();
        return { users };
    }
    static async getUser(req, res) {
        const { id } = req.params;
        return { user: { id: parseInt(id), name: 'User ' + id } };
    }
    static async createUser(req, res) {
        try {
            const user = await userService.create(req.body);
            return { user };
        }
        catch (error) {
            res.status(400);
            return { error: error.message };
        }
    }
};
__decorate([
    (0, src_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController, "getUsers", null);
__decorate([
    (0, src_1.Get)('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController, "getUser", null);
__decorate([
    (0, src_1.Post)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController, "createUser", null);
UserController = __decorate([
    (0, src_1.Controller)('/api/users')
], UserController);
// Create and configure the app
const app = (0, src_1.createApp)({ port: 3000 });
// Register controllers
app.registerController(UserController);
// Start server
app.listen(() => {
    console.log('Server running on http://localhost:3000');
    console.log('Try:');
    console.log('  GET  http://localhost:3000/api/users');
    console.log('  GET  http://localhost:3000/api/users/123');
    console.log('  POST http://localhost:3000/api/users');
});
exports.default = app;
//# sourceMappingURL=app.js.map