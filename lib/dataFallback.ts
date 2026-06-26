import { supabase } from "./supabase";
import {
  QUESTION_BANK_STATIC,
  RELATED_DESTINATIONS_STATIC,
  MOOD_CATEGORIES_STATIC,
  DEST_QUESTION_TEMPLATES_STATIC,
  QuestionBankItem,
  RelatedDestinationItem,
  MoodCategoryItem,
  DestQuestionTemplateItem
} from "./dataStatic";

/**
 * Exposes dynamic or fallback Question Bank.
 */
export async function getQuestionBank(): Promise<QuestionBankItem[]> {
  try {
    const { data, error } = await supabase.from("question_bank").select("*");
    if (error || !data || data.length === 0) {
      return QUESTION_BANK_STATIC;
    }
    return data as QuestionBankItem[];
  } catch (err) {
    return QUESTION_BANK_STATIC;
  }
}

/**
 * Exposes dynamic or fallback Related Destinations.
 */
export async function getRelatedDestinations(cityId?: string): Promise<RelatedDestinationItem[]> {
  try {
    let query = supabase.from("related_destinations").select("*");
    if (cityId) {
      query = query.eq("city_id", cityId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (cityId) {
        return RELATED_DESTINATIONS_STATIC.filter(r => r.city_id === cityId);
      }
      return RELATED_DESTINATIONS_STATIC;
    }
    return data as RelatedDestinationItem[];
  } catch (err) {
    if (cityId) {
      return RELATED_DESTINATIONS_STATIC.filter(r => r.city_id === cityId);
    }
    return RELATED_DESTINATIONS_STATIC;
  }
}

/**
 * Exposes dynamic or fallback Mood Categories.
 */
export async function getMoodCategories(): Promise<MoodCategoryItem[]> {
  try {
    const { data, error } = await supabase.from("mood_categories").select("*");
    if (error || !data || data.length === 0) {
      return MOOD_CATEGORIES_STATIC;
    }
    return data as MoodCategoryItem[];
  } catch (err) {
    return MOOD_CATEGORIES_STATIC;
  }
}

/**
 * Exposes dynamic or fallback Question Templates.
 */
export async function getDestQuestionTemplates(): Promise<DestQuestionTemplateItem[]> {
  try {
    const { data, error } = await supabase.from("destination_question_templates").select("*");
    if (error || !data || data.length === 0) {
      return DEST_QUESTION_TEMPLATES_STATIC;
    }
    return data as DestQuestionTemplateItem[];
  } catch (err) {
    return DEST_QUESTION_TEMPLATES_STATIC;
  }
}
