enum JobTypes {
  SYNC_CONNECTOR = "syncConnector",
  INIT_SNAPHSOT = "initSnapshot",
  INIT_ENVIRONMENT = "initEnvironment",
  INIT_MERGE_REQUEST = "initMergeRequest",
  INIT_FUNCTION = "initFunction",
  APPROVE_MERGE_REQUEST = "approveMergeRequest",
  PATCH_MERGE_REQUEST = "patchMergeRequest",
  SANDBOX_MERGE_REQUEST = "sandboxMergeRequest",
  RESTORE_SNAPSHOT = "restoreSnapshot",
  INIT_PROJECT = "initProject",
  UPGRADE_PROJECT = "upgradeProject",
  MIGRATE_PROJECT = "migrateProject",
  REMOVE_PROJECT = "removeProject",
  REMOVE_FUNCTION = "removeFunction",
  UPDATE_FUNCTION = "updateFunction",
  RUN_FUNCTION = "runFunction",
}

export default JobTypes;
