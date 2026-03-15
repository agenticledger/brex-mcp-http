import { z } from 'zod';
import { BrexClient } from './api-client.js';

/**
 * Brex MCP Tool Definitions
 *
 * 40 tools covering: Users, Departments, Locations, Company,
 * Cards, Transactions, Accounts, Expenses, Vendors, Transfers,
 * Budgets, Budget Programs, Webhooks, Travel
 */

interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (client: BrexClient, args: any) => Promise<any>;
}

// Reusable cursor-based pagination params
const paginationParams = {
  cursor: z.string().optional().describe('pagination cursor'),
  limit: z.number().optional().describe('max results'),
};

export const tools: ToolDef[] = [
  // ─── Users (5) ───────────────────────────────────────────

  {
    name: 'users_list',
    description: 'List users in the company',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listUsers(args),
  },
  {
    name: 'user_get',
    description: 'Get user by ID',
    inputSchema: z.object({
      id: z.string().describe('user ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getUser(args.id),
  },
  {
    name: 'user_get_me',
    description: 'Get current authenticated user',
    inputSchema: z.object({}),
    handler: async (client: BrexClient) =>
      client.getCurrentUser(),
  },
  {
    name: 'user_invite',
    description: 'Invite a new user',
    inputSchema: z.object({
      first_name: z.string().describe('first name'),
      last_name: z.string().describe('last name'),
      email: z.string().describe('email address'),
      manager_id: z.string().optional().describe('manager user ID'),
      data: z.string().optional().describe('full JSON body override'),
    }),
    handler: async (client: BrexClient, args: any) => {
      const body = args.data ? JSON.parse(args.data) : {
        first_name: args.first_name,
        last_name: args.last_name,
        email: args.email,
        manager_id: args.manager_id,
      };
      return client.inviteUser(body);
    },
  },
  {
    name: 'user_update',
    description: 'Update a user',
    inputSchema: z.object({
      id: z.string().describe('user ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.updateUser(args.id, JSON.parse(args.data)),
  },

  // ─── Departments (3) ─────────────────────────────────────

  {
    name: 'departments_list',
    description: 'List departments',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listDepartments(args),
  },
  {
    name: 'department_get',
    description: 'Get department by ID',
    inputSchema: z.object({
      id: z.string().describe('department ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getDepartment(args.id),
  },
  {
    name: 'department_create',
    description: 'Create a department',
    inputSchema: z.object({
      name: z.string().describe('department name'),
      description: z.string().optional().describe('description'),
      data: z.string().optional().describe('full JSON body override'),
    }),
    handler: async (client: BrexClient, args: any) => {
      const body = args.data ? JSON.parse(args.data) : {
        name: args.name,
        description: args.description,
      };
      return client.createDepartment(body);
    },
  },

  // ─── Locations (1) ───────────────────────────────────────

  {
    name: 'locations_list',
    description: 'List company locations',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listLocations(args),
  },

  // ─── Company (1) ─────────────────────────────────────────

  {
    name: 'company_get',
    description: 'Get company info',
    inputSchema: z.object({}),
    handler: async (client: BrexClient) =>
      client.getCompany(),
  },

  // ─── Cards (6) ───────────────────────────────────────────

  {
    name: 'cards_list',
    description: 'List cards',
    inputSchema: z.object({
      ...paginationParams,
      user_id: z.string().optional().describe('filter by user ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.listCards(args),
  },
  {
    name: 'card_get',
    description: 'Get card by ID',
    inputSchema: z.object({
      id: z.string().describe('card ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getCard(args.id),
  },
  {
    name: 'card_create',
    description: 'Create a card (virtual or physical)',
    inputSchema: z.object({
      owner_id: z.string().describe('card owner user ID'),
      card_name: z.string().describe('card name/label'),
      card_type: z.enum(['VIRTUAL', 'PHYSICAL']).describe('card type'),
      data: z.string().optional().describe('full JSON body override'),
    }),
    handler: async (client: BrexClient, args: any) => {
      const body = args.data ? JSON.parse(args.data) : {
        owner: { type: 'USER', user_id: args.owner_id },
        card_name: args.card_name,
        card_type: args.card_type,
      };
      return client.createCard(body);
    },
  },
  {
    name: 'card_update',
    description: 'Update a card',
    inputSchema: z.object({
      id: z.string().describe('card ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.updateCard(args.id, JSON.parse(args.data)),
  },
  {
    name: 'card_lock',
    description: 'Lock a card',
    inputSchema: z.object({
      id: z.string().describe('card ID'),
      reason: z.string().optional().describe('lock reason'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.lockCard(args.id, { reason: args.reason }),
  },
  {
    name: 'card_terminate',
    description: 'Terminate a card permanently',
    inputSchema: z.object({
      id: z.string().describe('card ID'),
      reason: z.string().optional().describe('termination reason'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.terminateCard(args.id, { reason: args.reason }),
  },

  // ─── Transactions (2) ────────────────────────────────────

  {
    name: 'card_transactions_list',
    description: 'List card transactions',
    inputSchema: z.object({
      ...paginationParams,
      posted_at_start: z.string().optional().describe('start date ISO'),
      posted_at_end: z.string().optional().describe('end date ISO'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.listCardTransactions(args),
  },
  {
    name: 'cash_transactions_list',
    description: 'List cash account transactions',
    inputSchema: z.object({
      cash_account_id: z.string().describe('cash account ID'),
      ...paginationParams,
      posted_at_start: z.string().optional().describe('start date ISO'),
      posted_at_end: z.string().optional().describe('end date ISO'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.listCashTransactions(args.cash_account_id, args),
  },

  // ─── Accounts (3) ────────────────────────────────────────

  {
    name: 'card_accounts_list',
    description: 'List card accounts',
    inputSchema: z.object({}),
    handler: async (client: BrexClient) =>
      client.listCardAccounts(),
  },
  {
    name: 'cash_accounts_list',
    description: 'List cash accounts',
    inputSchema: z.object({}),
    handler: async (client: BrexClient) =>
      client.listCashAccounts(),
  },
  {
    name: 'card_statements_list',
    description: 'List card statements',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listCardStatements(args),
  },

  // ─── Expenses (3) ────────────────────────────────────────

  {
    name: 'card_expenses_list',
    description: 'List card expenses',
    inputSchema: z.object({
      ...paginationParams,
      expand: z.string().optional().describe('expand fields (e.g. merchant)'),
      user_id: z.string().optional().describe('filter by user ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.listCardExpenses(args),
  },
  {
    name: 'card_expense_get',
    description: 'Get card expense by ID',
    inputSchema: z.object({
      expense_id: z.string().describe('expense ID'),
      expand: z.string().optional().describe('expand fields'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getCardExpense(args.expense_id, args),
  },
  {
    name: 'card_expense_update',
    description: 'Update a card expense',
    inputSchema: z.object({
      expense_id: z.string().describe('expense ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.updateCardExpense(args.expense_id, JSON.parse(args.data)),
  },

  // ─── Vendors (5) ─────────────────────────────────────────

  {
    name: 'vendors_list',
    description: 'List vendors',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listVendors(args),
  },
  {
    name: 'vendor_get',
    description: 'Get vendor by ID',
    inputSchema: z.object({
      id: z.string().describe('vendor ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getVendor(args.id),
  },
  {
    name: 'vendor_create',
    description: 'Create a vendor with payment details',
    inputSchema: z.object({
      company_name: z.string().describe('vendor company name'),
      data: z.string().optional().describe('full JSON body override'),
    }),
    handler: async (client: BrexClient, args: any) => {
      const body = args.data ? JSON.parse(args.data) : {
        company_name: args.company_name,
      };
      return client.createVendor(body);
    },
  },
  {
    name: 'vendor_update',
    description: 'Update a vendor',
    inputSchema: z.object({
      id: z.string().describe('vendor ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.updateVendor(args.id, JSON.parse(args.data)),
  },
  {
    name: 'vendor_delete',
    description: 'Delete a vendor',
    inputSchema: z.object({
      id: z.string().describe('vendor ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.deleteVendor(args.id),
  },

  // ─── Transfers (3) ───────────────────────────────────────

  {
    name: 'transfers_list',
    description: 'List transfers (ACH, wire, check)',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listTransfers(args),
  },
  {
    name: 'transfer_get',
    description: 'Get transfer by ID',
    inputSchema: z.object({
      id: z.string().describe('transfer ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getTransfer(args.id),
  },
  {
    name: 'transfer_create',
    description: 'Create a transfer (ACH/wire/check)',
    inputSchema: z.object({
      data: z.string().describe('full JSON transfer body'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.createTransfer(JSON.parse(args.data)),
  },

  // ─── Budgets (5) ─────────────────────────────────────────

  {
    name: 'budgets_list',
    description: 'List budgets',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listBudgets(args),
  },
  {
    name: 'budget_get',
    description: 'Get budget by ID',
    inputSchema: z.object({
      id: z.string().describe('budget ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getBudget(args.id),
  },
  {
    name: 'budget_create',
    description: 'Create a budget',
    inputSchema: z.object({
      data: z.string().describe('full JSON budget body'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.createBudget(JSON.parse(args.data)),
  },
  {
    name: 'budget_update',
    description: 'Update a budget',
    inputSchema: z.object({
      id: z.string().describe('budget ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.updateBudget(args.id, JSON.parse(args.data)),
  },
  {
    name: 'budget_archive',
    description: 'Archive a budget',
    inputSchema: z.object({
      id: z.string().describe('budget ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.archiveBudget(args.id),
  },

  // ─── Budget Programs (2) ─────────────────────────────────

  {
    name: 'budget_programs_list',
    description: 'List budget programs',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listBudgetPrograms(args),
  },
  {
    name: 'budget_program_get',
    description: 'Get budget program by ID',
    inputSchema: z.object({
      id: z.string().describe('budget program ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getBudgetProgram(args.id),
  },

  // ─── Webhooks (5) ────────────────────────────────────────

  {
    name: 'webhooks_list',
    description: 'List webhook subscriptions',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listWebhooks(args),
  },
  {
    name: 'webhook_get',
    description: 'Get webhook by ID',
    inputSchema: z.object({
      id: z.string().describe('webhook ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.getWebhook(args.id),
  },
  {
    name: 'webhook_create',
    description: 'Create a webhook subscription',
    inputSchema: z.object({
      url: z.string().describe('HTTPS callback URL'),
      event_types: z.string().describe('comma-separated event types'),
      data: z.string().optional().describe('full JSON body override'),
    }),
    handler: async (client: BrexClient, args: any) => {
      const body = args.data ? JSON.parse(args.data) : {
        url: args.url,
        event_types: args.event_types.split(',').map((s: string) => s.trim()),
      };
      return client.createWebhook(body);
    },
  },
  {
    name: 'webhook_update',
    description: 'Update a webhook',
    inputSchema: z.object({
      id: z.string().describe('webhook ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.updateWebhook(args.id, JSON.parse(args.data)),
  },
  {
    name: 'webhook_delete',
    description: 'Delete a webhook',
    inputSchema: z.object({
      id: z.string().describe('webhook ID'),
    }),
    handler: async (client: BrexClient, args: any) =>
      client.deleteWebhook(args.id),
  },

  // ─── Travel (1) ──────────────────────────────────────────

  {
    name: 'trips_list',
    description: 'List travel trips',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: BrexClient, args: any) =>
      client.listTrips(args),
  },
];
