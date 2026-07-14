export class PhotoEvidence {
  public readonly photoUrl?: string;
  public readonly capturedAt?: Date;

  constructor(photoUrl?: string, capturedAt?: Date) {
    if (photoUrl && photoUrl.trim().length === 0) {
      throw new Error("Photo URL cannot be empty if specified");
    }
    this.photoUrl = photoUrl;
    this.capturedAt = capturedAt;
  }

  public validate(required: boolean = true): void {
    if (required && !this.photoUrl) {
      throw new Error("MissingPhotoEvidence");
    }
  }

  public isValid(required: boolean = true): boolean {
    try {
      this.validate(required);
      return true;
    } catch {
      return false;
    }
  }
}
