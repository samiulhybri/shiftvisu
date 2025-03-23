/// Can be extended to get a nice copyWith implementation to update immutable models.
export class CopyWith {
  /// Utility method to create a clone of an object with modifications.
  public copyWith(modifyObject: { [P in keyof this]?: this[P] }): this {
    return Object.assign(Object.create(this.constructor.prototype), {
      ...this,
      ...modifyObject,
    });
  }
}
