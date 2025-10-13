#!/usr/bin/env python3
"""
Verify Security Issues - Check if malicious payloads were actually stored
"""

import requests
import json

BACKEND_URL = "https://bm-intelligence.preview.emergentagent.com/api"

def verify_stored_tickets():
    """Check what tickets are actually stored in the database"""
    print("🔍 Verifying stored tickets for security issues...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/tickets")
        if response.status_code == 200:
            tickets = response.json()
            print(f"Found {len(tickets)} tickets in database")
            
            # Check for XSS payloads
            xss_tickets = []
            sql_tickets = []
            other_malicious = []
            
            for ticket in tickets:
                store_name = ticket.get('store_name', '')
                issue = ticket.get('issue', '')
                description = ticket.get('description', '')
                
                # Check for XSS
                if ('<script>' in store_name or '<script>' in issue or '<script>' in description or
                    'javascript:' in store_name or 'javascript:' in issue or 'javascript:' in description):
                    xss_tickets.append(ticket)
                
                # Check for SQL injection
                if ('DROP TABLE' in store_name or 'DROP TABLE' in issue or 'DROP TABLE' in description or
                    "' OR 1=1" in store_name or "' OR 1=1" in issue or "' OR 1=1" in description):
                    sql_tickets.append(ticket)
                
                # Check for other malicious payloads
                malicious_patterns = ['../../etc/passwd', '${jndi:', '{{7*7}}', '<%=7*7%>']
                for pattern in malicious_patterns:
                    if (pattern in store_name or pattern in issue or pattern in description):
                        other_malicious.append({'ticket': ticket, 'pattern': pattern})
            
            print(f"\n🚨 SECURITY VERIFICATION RESULTS:")
            print(f"XSS Vulnerable Tickets: {len(xss_tickets)}")
            print(f"SQL Injection Vulnerable Tickets: {len(sql_tickets)}")
            print(f"Other Malicious Payloads: {len(other_malicious)}")
            
            if xss_tickets:
                print(f"\n⚠️ XSS VULNERABILITIES CONFIRMED:")
                for ticket in xss_tickets[:3]:  # Show first 3
                    print(f"  - ID: {ticket.get('id')}")
                    print(f"    Store: {ticket.get('store_name')}")
                    print(f"    Issue: {ticket.get('issue')}")
            
            if sql_tickets:
                print(f"\n⚠️ SQL INJECTION VULNERABILITIES CONFIRMED:")
                for ticket in sql_tickets[:3]:  # Show first 3
                    print(f"  - ID: {ticket.get('id')}")
                    print(f"    Store: {ticket.get('store_name')}")
                    print(f"    Issue: {ticket.get('issue')}")
            
            if other_malicious:
                print(f"\n⚠️ OTHER MALICIOUS PAYLOADS CONFIRMED:")
                for item in other_malicious[:3]:  # Show first 3
                    ticket = item['ticket']
                    pattern = item['pattern']
                    print(f"  - Pattern: {pattern}")
                    print(f"    ID: {ticket.get('id')}")
                    print(f"    Store: {ticket.get('store_name')}")
            
            return len(xss_tickets) > 0 or len(sql_tickets) > 0 or len(other_malicious) > 0
            
    except Exception as e:
        print(f"Error verifying tickets: {str(e)}")
        return False

if __name__ == "__main__":
    has_vulnerabilities = verify_stored_tickets()
    if has_vulnerabilities:
        print(f"\n🚨 CRITICAL: Security vulnerabilities confirmed - malicious payloads stored in database!")
    else:
        print(f"\n✅ No malicious payloads found in stored tickets")