-- Create RPC function to get pipeline transition counts
CREATE OR REPLACE FUNCTION get_pipeline_counts()
RETURNS TABLE (
  from_status TEXT,
  to_status TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function simulates pipeline transitions based on current application statuses
  -- In a real scenario, you would track actual status transitions in a separate table
  
  -- For now, we'll create logical flows based on current application counts
  -- This is a simplified approach for demonstration
  
  RETURN QUERY
  WITH status_counts AS (
    SELECT 
      status,
      COUNT(*) as app_count
    FROM applications 
    WHERE user_id = auth.uid()
    GROUP BY status
  ),
  flows AS (
    -- Applied to Under Review flow
    SELECT 
      'applied'::TEXT as from_status,
      'under-review'::TEXT as to_status,
      LEAST(
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'applied'), 0),
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'under-review'), 0) +
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'online-assessment'), 0) +
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'phone-screen'), 0) +
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'technical-interview'), 0) +
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'final-interview'), 0) +
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'offer'), 0) +
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'rejected'), 0) / 2
      ) as count
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'applied')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status IN ('under-review', 'online-assessment', 'phone-screen', 'technical-interview', 'final-interview', 'offer', 'rejected'))
    
    UNION ALL
    
    -- Under Review to Online Assessment
    SELECT 
      'under-review'::TEXT,
      'online-assessment'::TEXT,
      LEAST(
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'under-review'), 0),
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'online-assessment'), 0)
      )
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'under-review')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'online-assessment')
    
    UNION ALL
    
    -- Under Review to Phone Screen
    SELECT 
      'under-review'::TEXT,
      'phone-screen'::TEXT,
      LEAST(
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'under-review'), 0),
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'phone-screen'), 0)
      )
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'under-review')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'phone-screen')
    
    UNION ALL
    
    -- Online Assessment to Technical Interview
    SELECT 
      'online-assessment'::TEXT,
      'technical-interview'::TEXT,
      LEAST(
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'online-assessment'), 0),
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'technical-interview'), 0)
      )
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'online-assessment')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'technical-interview')
    
    UNION ALL
    
    -- Phone Screen to Technical Interview
    SELECT 
      'phone-screen'::TEXT,
      'technical-interview'::TEXT,
      LEAST(
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'phone-screen'), 0),
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'technical-interview'), 0)
      )
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'phone-screen')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'technical-interview')
    
    UNION ALL
    
    -- Technical Interview to Final Interview
    SELECT 
      'technical-interview'::TEXT,
      'final-interview'::TEXT,
      LEAST(
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'technical-interview'), 0),
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'final-interview'), 0)
      )
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'technical-interview')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'final-interview')
    
    UNION ALL
    
    -- Final Interview to Offer
    SELECT 
      'final-interview'::TEXT,
      'offer'::TEXT,
      LEAST(
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'final-interview'), 0),
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'offer'), 0)
      )
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'final-interview')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'offer')
    
    UNION ALL
    
    -- Final Interview to Rejected
    SELECT 
      'final-interview'::TEXT,
      'rejected'::TEXT,
      LEAST(
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'final-interview'), 0),
        COALESCE((SELECT app_count FROM status_counts WHERE status = 'rejected'), 0) / 2
      )
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'final-interview')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'rejected')
    
    UNION ALL
    
    -- Direct rejections from various stages
    SELECT 
      'applied'::TEXT,
      'rejected'::TEXT,
      COALESCE((SELECT app_count FROM status_counts WHERE status = 'rejected'), 0) / 4
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'applied')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'rejected')
    
    UNION ALL
    
    SELECT 
      'under-review'::TEXT,
      'rejected'::TEXT,
      COALESCE((SELECT app_count FROM status_counts WHERE status = 'rejected'), 0) / 4
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'under-review')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'rejected')
    
    UNION ALL
    
    -- Withdrawals
    SELECT 
      'applied'::TEXT,
      'withdrawn'::TEXT,
      COALESCE((SELECT app_count FROM status_counts WHERE status = 'withdrawn'), 0)
    WHERE EXISTS (SELECT 1 FROM status_counts WHERE status = 'applied')
      AND EXISTS (SELECT 1 FROM status_counts WHERE status = 'withdrawn')
  )
  SELECT 
    f.from_status,
    f.to_status,
    f.count
  FROM flows f
  WHERE f.count > 0
  ORDER BY f.from_status, f.to_status;
END;
$$; 