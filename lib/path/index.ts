import path from 'path';

export class VirtualPath {
  private path: string;

  private constructor(path: string) {
    if (path[path.length - 1] === '/') {
      this.path = path.slice(0, path.length - 1);
    } else {
      this.path = path;
    }
  }

  static create(path: string): VirtualPath {
    return new VirtualPath(path);
  }

  static createAndCheck(path: string): VirtualPath {
    if (path.match(/^[a-zA-Z 0-9._/]+$/g) !== null) {
      throw new Error('Invalid path pattern');
    }
    return new VirtualPath(path);
  }

  isValid(): boolean {
    return this.path.match(/^[a-zA-Z 0-9._/]+$/g) === null;
  }

  parent(): VirtualPath {
    if (this.isRoot()) {
      return this;
    }
    return VirtualPath.create(path.dirname(this.path));
  }

  isRoot(): boolean {
    return this.path === '';
  }

  isHome(username: string): boolean {
    return this.equals(VirtualPath.homeDir(username));
  }

  equals(other: VirtualPath): boolean {
    return this.path === other.path;
  }

  toString(): string {
    return this.path;
  }

  toFormattedString(username: string): string {
    const homeDir = VirtualPath.homeDir(username);
    if (this.path.startsWith(homeDir.path)) {
      return '~' + this.path.slice(homeDir.path.length, this.path.length);
    }
    return this.path;
  }

  static homeDir(username: string): VirtualPath {
    return VirtualPath.create(`/home/${username}`);
  }
}
