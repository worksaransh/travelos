-- Create select policies for config tables to allow public/anonymous reads
drop policy if exists "Allow select for everyone" on scoring_weights_config;
create policy "Allow select for everyone" on scoring_weights_config for select using (true);

drop policy if exists "Allow select for everyone" on persona_classification_rules;
create policy "Allow select for everyone" on persona_classification_rules for select using (true);
