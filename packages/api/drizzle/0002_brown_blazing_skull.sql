PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`projectId` text NOT NULL,
	`agentId` text NOT NULL,
	`timestamp` integer NOT NULL,
	`requestDetails` text,
	`responseDetails` text,
	`requestType` text NOT NULL,
	`costDetails` text,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_requests`("id", "projectId", "agentId", "timestamp", "requestDetails", "responseDetails", "requestType", "costDetails") SELECT "id", "projectId", "agentId", "timestamp", "requestDetails", "responseDetails", "requestType", "costDetails" FROM `requests`;--> statement-breakpoint
DROP TABLE `requests`;--> statement-breakpoint
ALTER TABLE `__new_requests` RENAME TO `requests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;