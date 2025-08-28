// helpers/token-blacklist.js
class TokenBlacklist {
    constructor() {
        this.blacklist = new Set()
    }

    add(token) {
        this.blacklist.add(token)
        // Opcional: limpiar tokens después de un tiempo (ej: 24 horas)
        setTimeout(() => this.blacklist.delete(token), 24 * 60 * 60 * 1000)
    }

    has(token) {
        return this.blacklist.has(token)
    }

    remove(token) {
        this.blacklist.delete(token)
    }
}

export const tokenBlacklist = new TokenBlacklist()