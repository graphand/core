enum JobTypes {
  SYNC_SEARCH = "syncSearch",
  INIT_SNAPHSOT = "initSnapshot",
  INIT_ENVIRONMENT = "initEnvironment",
  INIT_MERGE_REQUEST = "initMergeRequest",
  APPROVE_MERGE_REQUEST = "approveMergeRequest",
  PATCH_MERGE_REQUEST = "patchMergeRequest",
  SANDBOX_MERGE_REQUEST = "sandboxMergeRequest",
  RESTORE_SNAPSHOT = "restoreSnapshot",
}

export default JobTypes;
