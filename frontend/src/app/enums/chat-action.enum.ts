export enum ChatAction {
  /// The chat has been created. The first message in a group chat will be of this type.
  createChat = "CREATE_CHAT",
  /// A user has been added to this chat.
  addUser = "ADD_USER",
  /// A user has been removed from this chat.
  removeUser = "REMOVE_USER",
}
