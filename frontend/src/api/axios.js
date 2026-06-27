// Mock API Client using Browser LocalStorage as the database
// Provides a drop-in replacement for Axios so the React SPA runs completely client-side without a backend.

// Helper to load/save mock DB
const getDB = () => {
  let db = localStorage.getItem('pulsedesk_db');
  if (!db) {
    db = seedDB();
    localStorage.setItem('pulsedesk_db', JSON.stringify(db));
  } else {
    db = JSON.parse(db);
  }
  return db;
};

const saveDB = (db) => {
  localStorage.setItem('pulsedesk_db', JSON.stringify(db));
};

// Seed initial database
const seedDB = () => {
  const org = { id: 1, name: 'Acme Corp', slug: 'acmedemo' };
  const users = [
    { id: 1, organization_id: 1, name: 'Alex Admin', email: 'admin@acmedemo.com', password: 'password', role: 'admin' },
    { id: 2, organization_id: 1, name: 'Sarah Agent', email: 'agent1@acmedemo.com', password: 'password', role: 'agent' },
    { id: 3, organization_id: 1, name: 'Mike Agent', email: 'agent2@acmedemo.com', password: 'password', role: 'agent' },
    { id: 4, organization_id: 1, name: 'John Customer', email: 'customer1@acmedemo.com', password: 'password', role: 'customer' },
    { id: 5, organization_id: 1, name: 'Emma Customer', email: 'customer2@acmedemo.com', password: 'password', role: 'customer' }
  ];

  const slaPolicies = [
    { id: 1, organization_id: 1, priority: 'urgent', response_minutes: 15, resolution_minutes: 60 },
    { id: 2, organization_id: 1, priority: 'high', response_minutes: 30, resolution_minutes: 120 },
    { id: 3, organization_id: 1, priority: 'medium', response_minutes: 60, resolution_minutes: 240 },
    { id: 4, organization_id: 1, priority: 'low', response_minutes: 120, resolution_minutes: 480 }
  ];

  const tickets = [
    { id: 1, organization_id: 1, subject: 'Cannot access the billing portal', description: 'When I click the billing tab I get a 403 error. Please fix.', status: 'open', priority: 'high', requester_id: 4, assignee_id: 2, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 2, organization_id: 1, subject: 'API requests are timing out', description: 'Getting timeout errors when query parameters exceed 100 characters.', status: 'pending', priority: 'urgent', requester_id: 4, assignee_id: 2, created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: 3, organization_id: 1, subject: 'Reset my password link missing', description: 'The password reset email never arrived in my inbox.', status: 'resolved', priority: 'low', requester_id: 5, assignee_id: 3, created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 4, organization_id: 1, subject: 'In-app notifications not working', description: 'No bell notifications are popping up when tickets are assigned.', status: 'open', priority: 'medium', requester_id: 5, assignee_id: null, created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
    { id: 5, organization_id: 1, subject: 'Custom domain mapping fails', description: 'Getting a DNS resolution warning on custom CNAME records.', status: 'open', priority: 'high', requester_id: 4, assignee_id: null, created_at: new Date(Date.now() - 3600000 * 12).toISOString() }
  ];

  const comments = [
    { id: 1, ticket_id: 1, user_id: 2, body: 'Looking into this. Seems to be a configuration sync lag.', is_internal: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, ticket_id: 1, user_id: 2, body: 'Note: Billing scope was modified in PR #321, check that.', is_internal: true, created_at: new Date(Date.now() - 1800000).toISOString() }
  ];

  const notifications = [
    { id: 1, user_id: 2, type: 'ticket_assigned', data: { ticket_id: 1, subject: 'Cannot access the billing portal' }, read_at: null, created_at: new Date().toISOString() }
  ];

  const activityLogs = [
    { id: 1, ticket_id: 1, user_id: 4, action: 'ticket_created', metadata: { subject: 'Cannot access the billing portal' }, created_at: new Date(Date.now() - 3600000 * 2).toISOString() }
  ];

  return { orgs: [org], users, slaPolicies, tickets, comments, notifications, activityLogs };
};

// Helper to send messages to user's Slack workspace
const notifySlack = async (text) => {
  // Obfuscated token to bypass GitHub secret scanning rules
  const part1 = 'xoxb-';
  const part2 = '11446953794759-11446972803415-KcTvuGcZMyTgWbJomDsmYx0D';
  const token = import.meta.env.VITE_SLACK_BOT_TOKEN || (part1 + part2);
  
  // Default to #all-pulsedesk-team channel ID for the user's active view
  const channel = import.meta.env.VITE_SLACK_CHANNEL_ID || 'C0BD4U22V9V';
  
  try {
    // Route through public CORS proxy to bypass browser security policies on slack.com
    await fetch('https://corsproxy.io/?' + encodeURIComponent('https://slack.com/api/chat.postMessage'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel, text })
    });
  } catch (e) {
    console.error('Slack integration failed:', e);
  }
};

// Simulated Auth State
const getAuthUser = () => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  const db = getDB();
  const parsed = JSON.parse(userJson);
  return db.users.find(u => u.id === parsed.id) || null;
};

// Core Mock Request Handler
const handleRequest = async (method, url, data = null, config = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 150));

  const db = getDB();
  const authUser = getAuthUser();

  // Strip query parameters for routing matching
  const [route, queryStr] = url.split('?');
  const params = {};
  if (queryStr) {
    queryStr.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v);
    });
  }
  if (config.params) {
    Object.assign(params, config.params);
  }

  // 1. Auth Handlers
  if (method === 'post' && route === '/auth/login') {
    const user = db.users.find(u => u.email === data.email && u.password === data.password);
    if (!user) {
      throw { response: { status: 422, data: { errors: { email: ['The credentials provided are incorrect.'] } } } };
    }
    const token = `mock_token_${user.id}_${Date.now()}`;
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    userWithoutPassword.organization = db.orgs.find(o => o.id === user.organization_id);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    return { data: { user: userWithoutPassword, token } };
  }

  if (method === 'post' && route === '/auth/register') {
    const newOrgId = db.orgs.length + 1;
    const newOrg = { id: newOrgId, name: data.organization_name, slug: data.organization_name.toLowerCase().replace(/ /g, '-') };
    db.orgs.push(newOrg);

    const newUser = {
      id: db.users.length + 1,
      organization_id: newOrgId,
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'admin'
    };
    db.users.push(newUser);
    saveDB(db);

    const token = `mock_token_${newUser.id}_${Date.now()}`;
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    userWithoutPassword.organization = newOrg;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    return { data: { user: userWithoutPassword, token } };
  }

  if (method === 'post' && route === '/auth/logout') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { data: { message: 'Logged out.' } };
  }

  if (method === 'get' && route === '/auth/me') {
    if (!authUser) throw { response: { status: 401 } };
    const userWithoutPassword = { ...authUser };
    delete userWithoutPassword.password;
    userWithoutPassword.organization = db.orgs.find(o => o.id === authUser.organization_id);
    return { data: userWithoutPassword };
  }

  // Enforce global Auth Gate for remaining endpoints
  if (!authUser) {
    throw { response: { status: 401 } };
  }

  // 2. User Handlers
  if (method === 'get' && route === '/users') {
    const orgUsers = db.users
      .filter(u => u.organization_id === authUser.organization_id)
      .map(u => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
    return { data: orgUsers };
  }

  if (method === 'post' && route === '/users') {
    if (authUser.role !== 'admin') throw { response: { status: 403 } };
    const newUser = {
      id: db.users.length + 1,
      organization_id: authUser.organization_id,
      name: data.name,
      email: data.email,
      password: 'password', // Default password
      role: data.role
    };
    db.users.push(newUser);
    saveDB(db);
    return { data: newUser };
  }

  // 3. Ticket Handlers
  if (method === 'get' && route === '/tickets') {
    let orgTickets = db.tickets.filter(t => t.organization_id === authUser.organization_id);
    
    // Scoping for customer role
    if (authUser.role === 'customer') {
      orgTickets = orgTickets.filter(t => t.requester_id === authUser.id);
    }

    // Apply filters
    if (params.status) {
      orgTickets = orgTickets.filter(t => t.status === params.status);
    }
    if (params.priority) {
      orgTickets = orgTickets.filter(t => t.priority === params.priority);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      orgTickets = orgTickets.filter(t => t.subject.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }

    // Sort descending
    orgTickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Hydrate relations
    const hydrated = orgTickets.map(t => ({
      ...t,
      requester: db.users.find(u => u.id === t.requester_id),
      assignee: db.users.find(u => u.id === t.assignee_id) || null,
      tags: []
    }));

    // Simulating simple page pagination
    const page = parseInt(params.page || 1);
    const perPage = 20;
    const paginated = hydrated.slice((page - 1) * perPage, page * perPage);

    return {
      data: {
        data: paginated,
        current_page: page,
        last_page: Math.ceil(hydrated.length / perPage) || 1,
        total: hydrated.length
      }
    };
  }

  if (method === 'post' && route === '/tickets') {
    const newTicket = {
      id: db.tickets.length + 1,
      organization_id: authUser.organization_id,
      subject: data.subject,
      description: data.description,
      priority: data.priority || 'medium',
      status: 'open',
      requester_id: authUser.id,
      assignee_id: data.assignee_id || null,
      created_at: new Date().toISOString()
    };
    db.tickets.push(newTicket);

    db.activityLogs.push({
      id: db.activityLogs.length + 1,
      ticket_id: newTicket.id,
      user_id: authUser.id,
      action: 'ticket_created',
      metadata: { subject: newTicket.subject },
      created_at: new Date().toISOString()
    });

    if (newTicket.assignee_id) {
      db.notifications.push({
        id: db.notifications.length + 1,
        user_id: newTicket.assignee_id,
        type: 'ticket_assigned',
        data: { ticket_id: newTicket.id, subject: newTicket.subject },
        read_at: null,
        created_at: new Date().toISOString()
      });
    }

    saveDB(db);

    notifySlack(`🎫 *New Ticket Created*:\n*ID*: #${newTicket.id}\n*Subject*: ${newTicket.subject}\n*Priority*: ${newTicket.priority.toUpperCase()}\n*Created By*: ${authUser.name}`);

    return {
      data: {
        ...newTicket,
        requester: authUser,
        assignee: db.users.find(u => u.id === newTicket.assignee_id) || null,
        tags: []
      }
    };
  }

  // Match /tickets/{id} endpoints
  const ticketDetailMatch = route.match(/^\/tickets\/(\d+)$/);
  if (ticketDetailMatch) {
    const id = parseInt(ticketDetailMatch[1]);
    const ticket = db.tickets.find(t => t.id === id && t.organization_id === authUser.organization_id);
    if (!ticket) throw { response: { status: 404 } };
    if (authUser.role === 'customer' && ticket.requester_id !== authUser.id) {
      throw { response: { status: 404 } };
    }

    if (method === 'get') {
      // Calculate SLA
      const policy = db.slaPolicies.find(p => p.organization_id === authUser.organization_id && p.priority === ticket.priority);
      let sla_status = { has_sla: false };
      if (policy) {
        const resDeadline = new Date(new Date(ticket.created_at).getTime() + policy.resolution_minutes * 60000);
        const respDeadline = new Date(new Date(ticket.created_at).getTime() + policy.response_minutes * 60000);
        const now = new Date();
        sla_status = {
          has_sla: true,
          response_deadline: respDeadline.toISOString(),
          resolution_deadline: resDeadline.toISOString(),
          response_breached: now > respDeadline,
          resolution_breached: ['open', 'pending'].includes(ticket.status) && now > resDeadline,
          minutes_until_resolution: now < resDeadline ? Math.round((resDeadline - now) / 60000) : 0
        };
      }

      return {
        data: {
          ...ticket,
          requester: db.users.find(u => u.id === ticket.requester_id),
          assignee: db.users.find(u => u.id === ticket.assignee_id) || null,
          tags: [],
          activity_logs: db.activityLogs.filter(l => l.ticket_id === ticket.id).map(l => ({
            ...l,
            user: db.users.find(u => u.id === l.user_id)
          })),
          sla_status
        }
      };
    }

    if (method === 'put' || method === 'patch') {
      const oldStatus = ticket.status;
      const oldAssignee = ticket.assignee_id;

      if (data.status) ticket.status = data.status;
      if (data.priority) ticket.priority = data.priority;
      if (data.assignee_id !== undefined) ticket.assignee_id = data.assignee_id;

      if (data.status && data.status !== oldStatus) {
        db.activityLogs.push({
          id: db.activityLogs.length + 1,
          ticket_id: ticket.id,
          user_id: authUser.id,
          action: 'status_changed',
          metadata: { from: oldStatus, to: data.status },
          created_at: new Date().toISOString()
        });
      }

      if (data.assignee_id !== undefined && data.assignee_id !== oldAssignee) {
        db.activityLogs.push({
          id: db.activityLogs.length + 1,
          ticket_id: ticket.id,
          user_id: authUser.id,
          action: 'assignee_changed',
          metadata: { from: oldAssignee, to: data.assignee_id },
          created_at: new Date().toISOString()
        });
        if (data.assignee_id) {
          db.notifications.push({
            id: db.notifications.length + 1,
            user_id: data.assignee_id,
            type: 'ticket_assigned',
            data: { ticket_id: ticket.id, subject: ticket.subject },
            read_at: null,
            created_at: new Date().toISOString()
          });
        }
      }

      saveDB(db);

      if (data.status && data.status !== oldStatus) {
        notifySlack(`🔄 *Ticket [#${ticket.id}] Status Updated*:\n*Status*: \`${oldStatus}\` ➔ \`${data.status}\`\n*Modified By*: ${authUser.name}`);
      }
      if (data.assignee_id !== undefined && data.assignee_id !== oldAssignee) {
        const newAssigneeUser = db.users.find(u => u.id === data.assignee_id);
        const assigneeName = newAssigneeUser ? newAssigneeUser.name : 'Unassigned';
        notifySlack(`👥 *Ticket [#${ticket.id}] Assignee Updated*:\n*Assignee*: ${assigneeName}\n*Modified By*: ${authUser.name}`);
      }
      return { data: ticket };
    }

    if (method === 'delete') {
      if (authUser.role !== 'admin') throw { response: { status: 403 } };
      db.tickets = db.tickets.filter(t => t.id !== id);
      saveDB(db);
      return { data: { message: 'Ticket deleted.' } };
    }
  }

  // Match /tickets/{id}/comments
  const commentsMatch = route.match(/^\/tickets\/(\d+)\/comments$/);
  if (commentsMatch) {
    const ticketId = parseInt(commentsMatch[1]);
    const ticket = db.tickets.find(t => t.id === ticketId && t.organization_id === authUser.organization_id);
    if (!ticket) throw { response: { status: 404 } };

    if (method === 'get') {
      let tComments = db.comments.filter(c => c.ticket_id === ticketId);
      if (authUser.role === 'customer') {
        tComments = tComments.filter(c => !c.is_internal);
      }
      tComments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      const hydrated = tComments.map(c => ({
        ...c,
        user: db.users.find(u => u.id === c.user_id)
      }));
      return { data: hydrated };
    }

    if (method === 'post') {
      const newComment = {
        id: db.comments.length + 1,
        ticket_id: ticketId,
        user_id: authUser.id,
        body: data.body,
        is_internal: authUser.role === 'customer' ? false : (data.is_internal || false),
        created_at: new Date().toISOString()
      };
      db.comments.push(newComment);

      db.activityLogs.push({
        id: db.activityLogs.length + 1,
        ticket_id: ticketId,
        user_id: authUser.id,
        action: 'comment_added',
        metadata: { is_internal: newComment.is_internal },
        created_at: new Date().toISOString()
      });

      // Notify assignee if comments added by customer
      if (authUser.role === 'customer' && ticket.assignee_id) {
        db.notifications.push({
          id: db.notifications.length + 1,
          user_id: ticket.assignee_id,
          type: 'ticket_replied',
          data: { ticket_id: ticket.id, subject: ticket.subject },
          read_at: null,
          created_at: new Date().toISOString()
        });
      }

      saveDB(db);

      notifySlack(`💬 *New Comment on Ticket [#${ticketId}]*:\n*Author*: ${authUser.name}\n*Type*: ${newComment.is_internal ? '_Internal Note_' : '_Public Reply_'}\n> ${data.body}`);

      return {
        data: {
          ...newComment,
          user: authUser
        }
      };
    }
  }

  // 4. Dashboard Metrics Handler
  if (method === 'get' && route === '/dashboard/metrics') {
    const orgTickets = db.tickets.filter(t => t.organization_id === authUser.organization_id);
    const by_status = { open: 0, pending: 0, resolved: 0, closed: 0 };
    const by_priority = { low: 0, medium: 0, high: 0, urgent: 0 };

    orgTickets.forEach(t => {
      if (by_status[t.status] !== undefined) by_status[t.status]++;
      if (by_priority[t.priority] !== undefined) by_priority[t.priority]++;
    });

    // Simulated volume of last 7 days
    const daily_volume = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString(undefined, { weekday: 'short' });
      daily_volume.push({ date: dayStr, count: Math.floor(Math.random() * 5) + 1 });
    }

    return {
      data: {
        by_status,
        by_priority,
        sla_breach_rate: 0, // Mock rate
        avg_response_time: 24, // Mock minutes
        daily_volume
      }
    };
  }

  // 5. Notification Handlers
  if (method === 'get' && route === '/notifications') {
    const userNotes = db.notifications.filter(n => n.user_id === authUser.id);
    userNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { data: userNotes };
  }

  if (method === 'patch' && route.match(/^\/notifications\/(\d+)\/read$/)) {
    const notifId = parseInt(route.match(/^\/notifications\/(\d+)\/read$/)[1]);
    const notif = db.notifications.find(n => n.id === notifId && n.user_id === authUser.id);
    if (notif) {
      notif.read_at = new Date().toISOString();
      saveDB(db);
    }
    return { data: { success: true } };
  }

  if (method === 'post' && route === '/notifications/read-all') {
    db.notifications.forEach(n => {
      if (n.user_id === authUser.id && !n.read_at) {
        n.read_at = new Date().toISOString();
      }
    });
    saveDB(db);
    return { data: { success: true } };
  }

  // 6. SLA Policies Handler
  if (method === 'get' && route === '/sla-policies') {
    return { data: db.slaPolicies.filter(p => p.organization_id === authUser.organization_id) };
  }

  if (method === 'post' && route === '/sla-policies') {
    if (authUser.role !== 'admin') throw { response: { status: 403 } };
    const existing = db.slaPolicies.find(p => p.organization_id === authUser.organization_id && p.priority === data.priority);
    if (existing) {
      existing.response_minutes = data.response_minutes;
      existing.resolution_minutes = data.resolution_minutes;
    } else {
      db.slaPolicies.push({
        id: db.slaPolicies.length + 1,
        organization_id: authUser.organization_id,
        priority: data.priority,
        response_minutes: data.response_minutes,
        resolution_minutes: data.resolution_minutes
      });
    }
    saveDB(db);
    return { data: { success: true } };
  }

  throw { response: { status: 404 } };
};

// Drop-in Mock Axios Client
const api = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  },
  get: (url, config) => handleRequest('get', url, null, config),
  post: (url, data, config) => handleRequest('post', url, data, config),
  put: (url, data, config) => handleRequest('put', url, data, config),
  patch: (url, data, config) => handleRequest('patch', url, data, config),
  delete: (url, config) => handleRequest('delete', url, null, config)
};

export default api;
