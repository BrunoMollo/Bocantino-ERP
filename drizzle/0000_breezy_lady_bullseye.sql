CREATE TABLE `document_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entry_document` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_identifier` text NOT NULL,
	`issue_date` integer NOT NULL,
	`type_id` integer NOT NULL,
	FOREIGN KEY (`type_id`) REFERENCES `document_type`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ingredient` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ingredient_batch` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`supplier_bag_code` text NOT NULL,
	`amount_of_bags` integer NOT NULL,
	`full_amount` real NOT NULL,
	`used_amount` real DEFAULT 0 NOT NULL,
	`production_date` integer NOT NULL,
	`expiration_date` integer NOT NULL,
	`cost` integer NOT NULL,
	`currency_alpha_code` text(4) DEFAULT 'ARG' NOT NULL,
	`loss` real,
	`supplier_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	FOREIGN KEY (`supplier_id`,`ingredient_id`) REFERENCES `r_supplier_ingredient`(`supplier_id`,`ingredient_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ingridient_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`creation_date` integer NOT NULL,
	`total_cost` integer,
	`currency_alpha_code` text(4) DEFAULT 'ARG' NOT NULL,
	`document_id` integer NOT NULL,
    FOREIGN KEY (`document_id`) REFERENCES `entry_document`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`desc` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `supplier` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `r_ingredient_product` (
	`ingredient_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`amount` integer NOT NULL,
	PRIMARY KEY(`ingredient_id`, `product_id`),
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `r_supplier_ingredient` (
	`supplier_id` integer NOT NULL,
	`ingredient_id` integer NOT NULL,
	PRIMARY KEY(`ingredient_id`, `supplier_id`),
	FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`id`) ON UPDATE no action ON DELETE no action
);
