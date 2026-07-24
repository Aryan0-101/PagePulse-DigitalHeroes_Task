export class AuditError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuditError';
  }
}

export class InvalidUrlError extends AuditError {
  constructor() {
    super('Invalid URL.');
    this.name = 'InvalidUrlError';
  }
}

export class TimeoutError extends AuditError {
  constructor() {
    super('The website took too long to respond.');
    this.name = 'TimeoutError';
  }
}

export class NonHtmlError extends AuditError {
  constructor() {
    super('The provided URL does not contain an HTML page.');
    this.name = 'NonHtmlError';
  }
}

export class UnreachableError extends AuditError {
  constructor() {
    super('The website could not be reached.');
    this.name = 'UnreachableError';
  }
}
