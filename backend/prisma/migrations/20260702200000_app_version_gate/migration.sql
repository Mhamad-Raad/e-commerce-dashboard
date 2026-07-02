-- App version gate fields on the settings singleton (all nullable = gate off).
ALTER TABLE "Setting" ADD COLUMN "minAppVersion" TEXT;
ALTER TABLE "Setting" ADD COLUMN "latestAppVersion" TEXT;
ALTER TABLE "Setting" ADD COLUMN "appStoreUrl" TEXT;
ALTER TABLE "Setting" ADD COLUMN "playStoreUrl" TEXT;
