CREATE TABLE `config_items` (
	`project_id` text NOT NULL,
	`key` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`itemType` text NOT NULL,
	`value` text,
	`settings` text,
	PRIMARY KEY(`project_id`, `key`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `project_agents` (
	`id` text NOT NULL,
	`projectId` text NOT NULL,
	`label` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`lastConnectedAt` text,
	`status` text DEFAULT 'pending' NOT NULL,
	PRIMARY KEY(`projectId`, `id`),
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`privy_server_wallet_id` text NOT NULL,
	`name` text NOT NULL,
	`ownedByUserId` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`ownedByUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`projectId` text NOT NULL,
	`agentId` text NOT NULL,
	`timestamp` integer NOT NULL,
	`requestId` text,
	`requestDetails` text,
	`responseDetails` text,
	`requestType` text NOT NULL,
	`cost` integer,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
