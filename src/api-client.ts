/**
 * Brex API Client
 *
 * Base URL: https://platform.brexapis.com
 * Auth: Bearer token
 * APIs: Team, Cards, Transactions, Expenses, Payments, Budgets, Webhooks, Travel, Accounting
 */

const BASE_URL = 'https://platform.brexapis.com';

interface PaginationParams {
  cursor?: string;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export class BrexClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params } = options;
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 204) return {} as T;

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Brex API ${response.status}: ${text}`);
    }

    return response.json();
  }

  // ─── Users ───────────────────────────────────────────────

  async listUsers(params?: PaginationParams) {
    return this.request<any>('/v2/users', { params });
  }

  async getUser(id: string) {
    return this.request<any>(`/v2/users/${encodeURIComponent(id)}`);
  }

  async getCurrentUser() {
    return this.request<any>('/v2/users/me');
  }

  async inviteUser(body: any) {
    return this.request<any>('/v2/users', { method: 'POST', body });
  }

  async updateUser(id: string, body: any) {
    return this.request<any>(`/v2/users/${encodeURIComponent(id)}`, { method: 'PUT', body });
  }

  async setUserLimit(id: string, body: any) {
    return this.request<any>(`/v2/users/${encodeURIComponent(id)}/limit`, { method: 'POST', body });
  }

  // ─── Departments ─────────────────────────────────────────

  async listDepartments(params?: PaginationParams) {
    return this.request<any>('/v2/departments', { params });
  }

  async getDepartment(id: string) {
    return this.request<any>(`/v2/departments/${encodeURIComponent(id)}`);
  }

  async createDepartment(body: any) {
    return this.request<any>('/v2/departments', { method: 'POST', body });
  }

  // ─── Locations ───────────────────────────────────────────

  async listLocations(params?: PaginationParams) {
    return this.request<any>('/v2/locations', { params });
  }

  async createLocation(body: any) {
    return this.request<any>('/v2/locations', { method: 'POST', body });
  }

  // ─── Company ─────────────────────────────────────────────

  async getCompany() {
    return this.request<any>('/v2/company');
  }

  // ─── Cards ───────────────────────────────────────────────

  async listCards(params?: PaginationParams & { user_id?: string }) {
    return this.request<any>('/v2/cards', { params });
  }

  async getCard(id: string) {
    return this.request<any>(`/v2/cards/${encodeURIComponent(id)}`);
  }

  async createCard(body: any) {
    return this.request<any>('/v2/cards', { method: 'POST', body });
  }

  async updateCard(id: string, body: any) {
    return this.request<any>(`/v2/cards/${encodeURIComponent(id)}`, { method: 'PUT', body });
  }

  async lockCard(id: string, body: any) {
    return this.request<any>(`/v2/cards/${encodeURIComponent(id)}/lock`, { method: 'POST', body });
  }

  async terminateCard(id: string, body: any) {
    return this.request<any>(`/v2/cards/${encodeURIComponent(id)}/terminate`, { method: 'POST', body });
  }

  async getCardNumber(id: string) {
    return this.request<any>(`/v2/cards/${encodeURIComponent(id)}/pan`);
  }

  // ─── Transactions ────────────────────────────────────────

  async listCardTransactions(params?: PaginationParams & {
    posted_at_start?: string;
    posted_at_end?: string;
  }) {
    return this.request<any>('/v2/transactions/card/primary', { params });
  }

  async listCashTransactions(cashAccountId: string, params?: PaginationParams & {
    posted_at_start?: string;
    posted_at_end?: string;
  }) {
    return this.request<any>(`/v2/transactions/cash/${encodeURIComponent(cashAccountId)}`, { params });
  }

  // ─── Accounts ────────────────────────────────────────────

  async listCardAccounts() {
    return this.request<any>('/v2/accounts/card');
  }

  async listCashAccounts() {
    return this.request<any>('/v2/accounts/cash');
  }

  async listCardStatements(params?: PaginationParams) {
    return this.request<any>('/v2/accounts/card/primary/statements', { params });
  }

  // ─── Expenses ────────────────────────────────────────────

  async listCardExpenses(params?: PaginationParams & {
    expand?: string;
    user_id?: string;
  }) {
    return this.request<any>('/v1/expenses/card', { params });
  }

  async getCardExpense(expenseId: string, params?: { expand?: string }) {
    return this.request<any>(`/v1/expenses/card/${encodeURIComponent(expenseId)}`, { params });
  }

  async updateCardExpense(expenseId: string, body: any) {
    return this.request<any>(`/v1/expenses/card/${encodeURIComponent(expenseId)}`, { method: 'PUT', body });
  }

  // ─── Vendors ─────────────────────────────────────────────

  async listVendors(params?: PaginationParams) {
    return this.request<any>('/v1/vendors', { params });
  }

  async getVendor(id: string) {
    return this.request<any>(`/v1/vendors/${encodeURIComponent(id)}`);
  }

  async createVendor(body: any) {
    return this.request<any>('/v1/vendors', { method: 'POST', body });
  }

  async updateVendor(id: string, body: any) {
    return this.request<any>(`/v1/vendors/${encodeURIComponent(id)}`, { method: 'PUT', body });
  }

  async deleteVendor(id: string) {
    return this.request<any>(`/v1/vendors/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  // ─── Transfers ───────────────────────────────────────────

  async listTransfers(params?: PaginationParams) {
    return this.request<any>('/v1/transfers', { params });
  }

  async getTransfer(id: string) {
    return this.request<any>(`/v1/transfers/${encodeURIComponent(id)}`);
  }

  async createTransfer(body: any) {
    return this.request<any>('/v1/transfers', { method: 'POST', body });
  }

  // ─── Budgets ─────────────────────────────────────────────

  async listBudgets(params?: PaginationParams) {
    return this.request<any>('/v2/budgets', { params });
  }

  async getBudget(id: string) {
    return this.request<any>(`/v2/budgets/${encodeURIComponent(id)}`);
  }

  async createBudget(body: any) {
    return this.request<any>('/v2/budgets', { method: 'POST', body });
  }

  async updateBudget(id: string, body: any) {
    return this.request<any>(`/v2/budgets/${encodeURIComponent(id)}`, { method: 'PUT', body });
  }

  async archiveBudget(id: string) {
    return this.request<any>(`/v2/budgets/${encodeURIComponent(id)}/archive`, { method: 'POST' });
  }

  // ─── Budget Programs ─────────────────────────────────────

  async listBudgetPrograms(params?: PaginationParams) {
    return this.request<any>('/v2/budget_programs', { params });
  }

  async getBudgetProgram(id: string) {
    return this.request<any>(`/v2/budget_programs/${encodeURIComponent(id)}`);
  }

  // ─── Webhooks ────────────────────────────────────────────

  async listWebhooks(params?: PaginationParams) {
    return this.request<any>('/v1/webhooks', { params });
  }

  async getWebhook(id: string) {
    return this.request<any>(`/v1/webhooks/${encodeURIComponent(id)}`);
  }

  async createWebhook(body: any) {
    return this.request<any>('/v1/webhooks', { method: 'POST', body });
  }

  async updateWebhook(id: string, body: any) {
    return this.request<any>(`/v1/webhooks/${encodeURIComponent(id)}`, { method: 'PUT', body });
  }

  async deleteWebhook(id: string) {
    return this.request<any>(`/v1/webhooks/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async listWebhookSecrets() {
    return this.request<any>('/v1/webhooks/secrets');
  }

  // ─── Travel ──────────────────────────────────────────────

  async listTrips(params?: PaginationParams) {
    return this.request<any>('/v1/trips', { params });
  }
}
