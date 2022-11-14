export class JwtUtil {
  
  /**
   * Decode a base64 encoded string.
   * 
   * @param {string} str The base 64 encoded string.
   * @returns {string|null}
   */
  private urlBase64Decode(str: string) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0: { break; }
      case 2: { output += '=='; break; }
      case 3: { output += '='; break; }
      default: {
        return null;
      }
    }
    return decodeURIComponent(encodeURI(window.atob(output)));
  }

  /**
   * Convert a stringified JSON token to an object.
   * 
   * @param {string} token The token string to decode.
   * @returns {object|null}
   */
  public decodeToken(token: string) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      return null;
    }
    return JSON.parse(decoded);
  }
}
