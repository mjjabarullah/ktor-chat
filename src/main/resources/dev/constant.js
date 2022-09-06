/**
 * Message type
 * */

export const MessageType = {
    Join: 'Join',
    Chat: 'Chat',
    Leave: 'Leave',
    DelChat: 'DelChat',
    Report: 'Report',
    ActionTaken: 'ActionTaken',
    News: 'News',
    DelNews: 'DelNews',
    GlobalFeed: 'GlobalFeed',
    DelGlobalFeed: 'DelGlobalFeed',
    Adminship: 'Adminship',
    DelAdminship: 'DelAdminship',
    DataChanges: 'DataChanges',
    Mute: 'Mute',
    UnMute: 'UnMute',
    Kick: 'Kick',
    Ban: 'Ban'
}
/**
 * Status Type
 * */
export const Status = {Stay: 'Stay', Online: 'Online', Away: 'Away', Busy: 'Busy'}
/**
 * Report Type
 * */
export const ReportType = {Chat: 'Chat', PvtChat: 'PvtChat', NewsFeed: 'NewsFeed'}
/**
 * Success
 * */
export const Success = {
    AVATAR_CHANGED: 'Avatar has been changed',
    NAME_CHANGED: 'Name has been changed',
    NAME_CUSTOMIZED: 'Name text customized.',
    MOOD_CHANGED: 'Mood has been changed',
    ABOUT_CHANGED: 'About me has been changed',
    PASSWORD_CHANGED: 'Password has been changed',
    STATUS_CHANGED: 'Status has been changed',
    GENDER_CHANGED: 'Gender has been changed',
    DOB_CHANGED: 'DOB has been changed',
    CHAT_TEXT_CUSTOMIZED: 'Chat text customized',
    NEWS_CREATED: 'Announcement created successfully',
    NEWS_DELETED: 'Announcement deleted successfully',
    ADMINSHIP_CREATED: 'Adminship post created successfully',
    ADMINSHIP_DELETED: 'Adminship post deleted successfully',
    GLOBAL_FEED_CREATED: 'Adminship post created successfully',
    GLOBAL_FEED_DELETED: 'Adminship post deleted successfully'
}


/**
 * Errors
 * */
export const Errors = {
    NAME_INVALID: 'Must have min 4 to max 12 letters',
    MOOD_INVALID: 'Must have max 40 letters',
    PERMISSION_DENIED: 'Permission denied',
    SOMETHING_WENT_WRONG: 'Something went wrong',
    INVALID_FILE_FORMAT: 'Invalid file format',
    GUEST_DOESNT_HAVE_PASSWORD: 'Guest does not have password',
    PASSWORD_MUST_HAVE: 'Must have at least 8 characters',
    YOU_ARE_MUTED: 'You are muted',
    RECORD_LENGTH: 'Record length at least 10 seconds',
    UPLOAD_FAILED: 'Upload failed',
    RECORDING_FAILED: 'Recording failed',
    DELETE_MESSAGE: 'Deleting message failed',
    CANT_PRIVATE: 'You cannot private to this user',
    NO_MIC_PERMISSION: 'You haven\'t given mic permission',
    CONTENT_EMPTY: 'Content cannot be empty'
}


/**
 * Css classes
 * */
export const Css = {
    SUCCESS: 'success',
    ERROR: 'error',
    GREEN: 'green',
    YELLOW: 'yellow',
    RED: 'red'
}


/**
 * Commons
 * */
export const Defaults = {
    EMPTY_STRING: '',
    UNDEFINED: 'undefined',
    FUNC_TYPE: 'function',
    GUEST: 'guest',
    MAX_RECORDING_TIME: 180,
    MIN_RECORDING_TIME: 10
}

