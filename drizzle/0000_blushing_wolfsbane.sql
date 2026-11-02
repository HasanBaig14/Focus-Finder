CREATE TABLE `settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`start` integer DEFAULT 540 NOT NULL,
	`end` integer DEFAULT 1020 NOT NULL,
	`break_minutes` integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`priority` text NOT NULL,
	`minutes` integer NOT NULL,
	`due` text,
	`completed` integer DEFAULT false NOT NULL,
	`scheduled_date` text,
	`start` integer,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_user_idx` ON `tasks` (`user_id`);