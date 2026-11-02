import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const tasks = sqliteTable('tasks', {
 id:text('id').primaryKey(), userId:text('user_id').notNull(), title:text('title').notNull(),
 category:text('category').notNull(), priority:text('priority').notNull(), minutes:integer('minutes').notNull(),
 due:text('due'), completed:integer('completed',{mode:'boolean'}).notNull().default(false),
 scheduledDate:text('scheduled_date'), start:integer('start'), reason:text('reason').notNull(), createdAt:text('created_at').notNull()
},t=>[index('tasks_user_idx').on(t.userId)]);
export const settings=sqliteTable('settings',{userId:text('user_id').primaryKey(),start:integer('start').notNull().default(540),end:integer('end').notNull().default(1020),breakMinutes:integer('break_minutes').notNull().default(10)});
