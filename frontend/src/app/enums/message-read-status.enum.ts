export enum ReadByUserStatus {
  /// The message was read by the current user.
  read,
  /// The message was not yet read by the current user, and should be marked as read when he does.
  unread,
  /// The message was sent before the current user became part of the group,
  /// and should not be marked as read when it is read.
  noStatus,
}
