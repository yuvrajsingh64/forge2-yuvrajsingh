<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Organization;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\TicketTag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::create([
            'name' => 'Acme Corp',
            'slug' => 'acmedemo',
        ]);

        $admin = User::create([
            'organization_id' => $org->id,
            'name' => 'Alex Admin',
            'email' => 'admin@acmedemo.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $agent1 = User::create([
            'organization_id' => $org->id,
            'name' => 'Sarah Agent',
            'email' => 'agent1@acmedemo.com',
            'password' => Hash::make('password'),
            'role' => 'agent',
        ]);

        $agent2 = User::create([
            'organization_id' => $org->id,
            'name' => 'Mike Agent',
            'email' => 'agent2@acmedemo.com',
            'password' => Hash::make('password'),
            'role' => 'agent',
        ]);

        $customer1 = User::create([
            'organization_id' => $org->id,
            'name' => 'Jane Customer',
            'email' => 'customer1@acmedemo.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        $customer2 = User::create([
            'organization_id' => $org->id,
            'name' => 'Bob Customer',
            'email' => 'customer2@acmedemo.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        $slaPolicies = [
            'low' => [480, 2880],
            'medium' => [240, 1440],
            'high' => [60, 480],
            'urgent' => [15, 120],
        ];

        foreach ($slaPolicies as $priority => [$response, $resolution]) {
            SlaPolicy::create([
                'organization_id' => $org->id,
                'priority' => $priority,
                'response_minutes' => $response,
                'resolution_minutes' => $resolution,
            ]);
        }

        $tickets = [
            [
                'subject' => 'Cannot access the billing portal',
                'description' => 'I have been unable to access the billing portal for the past 2 days. The page returns a 404 error.',
                'status' => 'open',
                'priority' => 'high',
                'requester_id' => $customer1->id,
                'assignee_id' => $agent1->id,
                'tags' => ['billing', 'access'],
                'comments' => [
                    ['user_id' => $agent1->id, 'body' => 'Hi Jane, I am looking into this. Can you confirm which browser you are using?', 'is_internal' => false],
                    ['user_id' => $customer1->id, 'body' => 'I am using Chrome 124 on Windows 11.', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'API rate limit exceeded unexpectedly',
                'description' => 'Our integration is hitting 429 errors at around 50 requests per minute, well below the documented limit of 1000/min.',
                'status' => 'pending',
                'priority' => 'urgent',
                'requester_id' => $customer2->id,
                'assignee_id' => $agent2->id,
                'tags' => ['api', 'rate-limit'],
                'comments' => [
                    ['user_id' => $agent2->id, 'body' => 'I have escalated this to the platform team internally.', 'is_internal' => true],
                    ['user_id' => $agent2->id, 'body' => 'We are investigating an issue with our rate limit counters. ETA 4 hours.', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'Export to CSV not working',
                'description' => 'When I click Export to CSV on the reports page nothing happens. No download starts, no error shown.',
                'status' => 'open',
                'priority' => 'medium',
                'requester_id' => $customer1->id,
                'assignee_id' => null,
                'tags' => ['export', 'reports'],
                'comments' => [],
            ],
            [
                'subject' => 'SSO login fails with SAML error',
                'description' => 'Our SSO integration stopped working after your last update. Users get: SAML response signature verification failed.',
                'status' => 'open',
                'priority' => 'urgent',
                'requester_id' => $customer2->id,
                'assignee_id' => $agent1->id,
                'tags' => ['sso', 'authentication'],
                'comments' => [
                    ['user_id' => $agent1->id, 'body' => 'Could you share your SAML metadata XML so I can compare against our expected format?', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'Invoice #INV-2024-089 shows incorrect amount',
                'description' => 'Invoice #INV-2024-089 charges us for 50 seats but we only have 30 active users this month.',
                'status' => 'resolved',
                'priority' => 'high',
                'requester_id' => $customer1->id,
                'assignee_id' => $admin->id,
                'tags' => ['billing', 'invoice'],
                'comments' => [
                    ['user_id' => $admin->id, 'body' => 'We have identified the issue. A billing calculation bug affected accounts that downgraded this cycle.', 'is_internal' => false],
                    ['user_id' => $admin->id, 'body' => 'A corrected invoice has been issued. Credit applied to your account.', 'is_internal' => false],
                    ['user_id' => $customer1->id, 'body' => 'Thank you, I can see the credit now.', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'Feature request: dark mode for dashboard',
                'description' => 'It would be great to have a dark mode option in the dashboard settings. The current white theme is harsh in low-light environments.',
                'status' => 'open',
                'priority' => 'low',
                'requester_id' => $customer2->id,
                'assignee_id' => null,
                'tags' => ['feature-request', 'ui'],
                'comments' => [
                    ['user_id' => $agent2->id, 'body' => 'Thanks for the suggestion. Adding this to our product backlog.', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'Webhook deliveries are delayed by 10+ minutes',
                'description' => 'Webhooks that should fire immediately are arriving 10-15 minutes late. This is breaking our order processing pipeline.',
                'status' => 'pending',
                'priority' => 'high',
                'requester_id' => $customer1->id,
                'assignee_id' => $agent2->id,
                'tags' => ['webhooks', 'performance'],
                'comments' => [
                    ['user_id' => $agent2->id, 'body' => 'We had a queue backlog between 14:00 and 16:00 UTC today. This should be resolved now.', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'Cannot add team members to workspace',
                'description' => 'When I try to invite new team members I get: Invitation failed. Please try again. The invite email is never sent.',
                'status' => 'closed',
                'priority' => 'medium',
                'requester_id' => $customer2->id,
                'assignee_id' => $agent1->id,
                'tags' => ['team', 'invitations'],
                'comments' => [
                    ['user_id' => $agent1->id, 'body' => 'This was caused by a misconfigured email provider setting. Fixed in our last deploy.', 'is_internal' => false],
                    ['user_id' => $customer2->id, 'body' => 'Confirmed, invitations are working now. Thank you!', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'Data export missing fields after schema update',
                'description' => 'Since your schema migration last Friday, our data exports no longer include the custom_fields column.',
                'status' => 'open',
                'priority' => 'medium',
                'requester_id' => $customer1->id,
                'assignee_id' => $agent2->id,
                'tags' => ['data-export', 'schema'],
                'comments' => [
                    ['user_id' => $agent2->id, 'body' => 'Confirmed regression. The field was accidentally excluded from the export query. Fix deploying today.', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'Two-factor authentication codes not arriving',
                'description' => 'After enabling 2FA, the SMS codes are not being delivered. I have verified my phone number is correct.',
                'status' => 'open',
                'priority' => 'high',
                'requester_id' => $customer2->id,
                'assignee_id' => $agent1->id,
                'tags' => ['2fa', 'sms'],
                'comments' => [],
            ],
            [
                'subject' => 'Dashboard load time exceeds 8 seconds',
                'description' => 'The main dashboard page takes 8-12 seconds to load. This only started after we passed 5000 tickets in our account.',
                'status' => 'pending',
                'priority' => 'medium',
                'requester_id' => $customer1->id,
                'assignee_id' => $admin->id,
                'tags' => ['performance', 'dashboard'],
                'comments' => [
                    ['user_id' => $admin->id, 'body' => 'We have identified missing indexes on the tickets table for accounts with high volume. Patch scheduled.', 'is_internal' => true],
                    ['user_id' => $admin->id, 'body' => 'A performance fix is rolling out in the next maintenance window. You should see improvement within 24 hours.', 'is_internal' => false],
                ],
            ],
            [
                'subject' => 'Mobile app crashes on ticket attachment upload',
                'description' => 'The iOS app crashes every time I try to attach a file larger than 5MB to a ticket. Running iOS 17.4 on iPhone 14.',
                'status' => 'open',
                'priority' => 'medium',
                'requester_id' => $customer2->id,
                'assignee_id' => null,
                'tags' => ['mobile', 'ios', 'attachments'],
                'comments' => [],
            ],
        ];

        foreach ($tickets as $ticketData) {
            $comments = $ticketData['comments'];
            $tags = $ticketData['tags'];
            unset($ticketData['comments'], $ticketData['tags']);

            $ticketData['organization_id'] = $org->id;
            $ticket = Ticket::withoutGlobalScopes()->create($ticketData);

            foreach ($tags as $tag) {
                TicketTag::create(['ticket_id' => $ticket->id, 'name' => $tag]);
            }

            foreach ($comments as $comment) {
                $comment['ticket_id'] = $ticket->id;
                Comment::create($comment);
            }
        }
    }
}
