class TokenBlacklist {
    private blacklist: Set<string>;

    constructor() {
        this.blacklist = new Set<string>();
    }

    add(token: string): void {
        this.blacklist.add(token);
        // Opcional: limpiar tokens después de un tiempo (ej: 24 horas)
        setTimeout(() => this.blacklist.delete(token), 24 * 60 * 60 * 1000);
    }

    has(token: string): boolean {
        return this.blacklist.has(token);
    }

    remove(token: string): void {
        this.blacklist.delete(token);
    }

    clear(): void {
        this.blacklist.clear();
    }

    size(): number {
        return this.blacklist.size;
    }
}

// Exportar una instancia única (singleton)
export const tokenBlacklist = new TokenBlacklist();