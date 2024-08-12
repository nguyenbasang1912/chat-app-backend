login {
  username,
  password,
  fullname,
  tokens
}

register {
  username,
  password,
  fullname,
}

room {
  name,
  host,
  is_group,
  members,
  delete_messages,
}

message {
  sender,
  content,
  room_id,
  is_delete,
  time_stamp
}