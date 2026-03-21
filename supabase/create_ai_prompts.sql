-- Create AI Prompts table
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_prompt TEXT NOT NULL,
    description_prompt TEXT NOT NULL,
    image_prompt TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default values if not exists
INSERT INTO ai_prompts (title_prompt, description_prompt, image_prompt)
SELECT 
    'Analyze this product image and provide a catchy title in Moroccan Darija (Arabic script only, no French).',
    'Write a professional marketing description in Moroccan Darija (Arabic script only, no French).',
    'Transform the uploaded clothing image into a professional fashion e-commerce product photo. WIDE SHOT. PULL BACK SIGNIFICANTLY. Full body visible. Square 1:1 format. White background.'
WHERE NOT EXISTS (SELECT 1 FROM ai_prompts);
