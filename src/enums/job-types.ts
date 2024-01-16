enum JobTypes {
  SYNC_SEARCH = "syncSearch",
  INIT_BACKUP = "initBackup",
  INIT_ENVIRONMENT = "initEnvironment",
  INIT_MERGE_REQUEST = "initMergeRequest",
  RESTORE_BACKUP = "restoreBackup",
  APPROVE_MERGE_REQUEST = "approveMergeRequest",
  PATCH_MERGE_REQUEST = "patchMergeRequest",
  SANDBOX_MERGE_REQUEST = "sandboxMergeRequest",
}

export default JobTypes;
