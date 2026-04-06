# Goals API - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Variables

- [ ] `GOALS_API_KEY` is set (secure random string)
- [ ] `ADMIN_API_KEY` is set (different secure random string)
- [ ] `OPENAI_API_KEY` is set and valid
- [ ] All keys are different from development keys
- [ ] Keys are stored securely (not in version control)

### ✅ Code Review

- [ ] All API endpoints are tested
- [ ] Error handling is comprehensive
- [ ] Input validation is working
- [ ] Authentication is properly implemented
- [ ] No console.log statements in production code
- [ ] TypeScript types are correct

### ✅ Testing

- [ ] User endpoint tested with valid session
- [ ] Admin endpoint tested with valid API key
- [ ] Error cases tested (invalid keys, missing fields)
- [ ] AI generation tested with various prompts
- [ ] Fallback mechanism tested
- [ ] Test script runs successfully

### ✅ Security

- [ ] API keys are not exposed in client-side code
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Rate limiting is considered
- [ ] Input sanitization is in place
- [ ] Error messages don't leak sensitive info

### ✅ Documentation

- [ ] API documentation is complete
- [ ] Setup guide is clear
- [ ] Examples are tested and working
- [ ] Team is trained on API usage
- [ ] Support process is defined

## Deployment Steps

### Step 1: Environment Setup

```bash
# Production environment variables
GOALS_API_KEY=<generate-new-secure-key>
ADMIN_API_KEY=<generate-new-secure-key>
OPENAI_API_KEY=<your-production-openai-key>

# Generate secure keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Deploy Code

```bash
# Commit changes
git add .
git commit -m "Add Goals API endpoints"

# Push to repository
git push origin main

# Deploy (adjust for your platform)
# Vercel: Automatic deployment
# Other: Follow your deployment process
```

### Step 3: Verify Deployment

```bash
# Test admin endpoint
curl -X POST https://your-domain.com/api/admin/goals/create-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test goal",
    "difficulty": "medium",
    "userId": "test-user-id",
    "adminApiKey": "your-admin-api-key"
  }'

# Expected: 200 OK with goal data
```

### Step 4: Monitor

- [ ] Check server logs for errors
- [ ] Monitor API response times
- [ ] Track API usage
- [ ] Set up alerts for failures

## Post-Deployment Checklist

### ✅ Functionality

- [ ] Admin UI is accessible at `/admin/ai-goals`
- [ ] User endpoint works with authenticated users
- [ ] Admin endpoint works with API key
- [ ] AI generation is working
- [ ] Goals are being created correctly
- [ ] Milestones are properly structured

### ✅ Performance

- [ ] API response time is acceptable (< 5 seconds)
- [ ] OpenAI API calls are successful
- [ ] Database operations are fast
- [ ] No memory leaks
- [ ] Server resources are adequate

### ✅ Monitoring

- [ ] Error logging is working
- [ ] API usage is being tracked
- [ ] Alerts are configured
- [ ] Dashboard is set up (if applicable)

### ✅ Documentation

- [ ] Production API URL is documented
- [ ] Team has access to documentation
- [ ] Support process is communicated
- [ ] Known issues are documented

## Rollback Plan

If issues occur:

1. **Immediate Actions**
   - [ ] Disable the API endpoints (return 503)
   - [ ] Notify team
   - [ ] Check error logs

2. **Investigation**
   - [ ] Identify the issue
   - [ ] Check environment variables
   - [ ] Verify OpenAI API status
   - [ ] Review recent changes

3. **Resolution**
   - [ ] Fix the issue
   - [ ] Test in staging
   - [ ] Redeploy
   - [ ] Verify fix

4. **If Needed: Rollback**
   ```bash
   # Revert to previous version
   git revert HEAD
   git push origin main
   # Redeploy
   ```

## Monitoring Checklist

### Daily

- [ ] Check error logs
- [ ] Review API usage
- [ ] Monitor response times
- [ ] Check OpenAI API credits

### Weekly

- [ ] Review API usage trends
- [ ] Check for unusual patterns
- [ ] Review user feedback
- [ ] Update documentation if needed

### Monthly

- [ ] Rotate API keys (if policy requires)
- [ ] Review security
- [ ] Analyze performance metrics
- [ ] Plan improvements

## Common Issues & Solutions

### Issue: "Invalid API key"

**Cause:** API key not set or incorrect

**Solution:**
1. Check environment variables
2. Verify key matches what's in request
3. Restart server after changing env vars

### Issue: "Failed to generate goal"

**Cause:** OpenAI API issue

**Solution:**
1. Check OpenAI API status
2. Verify API key has credits
3. Check rate limits
4. Review error logs

### Issue: "User not found"

**Cause:** Invalid user ID

**Solution:**
1. Verify user ID exists in database
2. Check UUID format
3. Ensure user hasn't been deleted

### Issue: Slow response times

**Cause:** OpenAI API latency

**Solution:**
1. Implement caching
2. Add timeout handling
3. Consider async processing
4. Monitor OpenAI API status

## Security Audit

### Before Production

- [ ] API keys are strong (32+ characters)
- [ ] Keys are unique per environment
- [ ] No keys in version control
- [ ] HTTPS is enforced
- [ ] Input validation is thorough
- [ ] Error messages are safe
- [ ] Rate limiting is considered
- [ ] Logging doesn't expose sensitive data

### Regular Audits

- [ ] Review access logs
- [ ] Check for suspicious activity
- [ ] Update dependencies
- [ ] Review security best practices
- [ ] Test for vulnerabilities

## Performance Optimization

### Current State

- [ ] Measure baseline performance
- [ ] Document response times
- [ ] Track resource usage

### Optimization Options

- [ ] Implement caching
- [ ] Add request queuing
- [ ] Optimize database queries
- [ ] Use CDN for static assets
- [ ] Consider serverless functions

## Support & Maintenance

### Support Process

1. **User Reports Issue**
   - Check error logs
   - Verify environment variables
   - Test endpoint manually
   - Review recent changes

2. **Troubleshooting**
   - Use test script
   - Check OpenAI API status
   - Verify database connectivity
   - Review server resources

3. **Resolution**
   - Fix issue
   - Test thoroughly
   - Deploy fix
   - Notify user

### Maintenance Schedule

- **Daily:** Monitor logs and metrics
- **Weekly:** Review usage and performance
- **Monthly:** Security audit and updates
- **Quarterly:** Feature review and planning

## Success Metrics

### Track These Metrics

- [ ] API request count
- [ ] Success rate
- [ ] Average response time
- [ ] Error rate
- [ ] User adoption
- [ ] Goal creation rate

### Goals

- Success rate: > 95%
- Response time: < 5 seconds
- Error rate: < 5%
- Uptime: > 99%

## Final Verification

Before marking deployment complete:

- [ ] All checklist items are completed
- [ ] API is working in production
- [ ] Team is notified
- [ ] Documentation is updated
- [ ] Monitoring is active
- [ ] Support process is ready

---

## Quick Reference

### Test Commands

```bash
# Test admin endpoint
curl -X POST https://your-domain.com/api/admin/goals/create-with-ai \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test","difficulty":"medium","userId":"uuid","adminApiKey":"key"}'

# Run test script
node test-goals-api.js

# Check logs
# (Adjust for your platform)
```

### Emergency Contacts

- **OpenAI Support:** https://help.openai.com
- **Supabase Support:** https://supabase.com/support
- **Team Lead:** [Add contact]
- **DevOps:** [Add contact]

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Verified By:** _____________

**Notes:** _____________________________________________
