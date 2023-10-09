import { MarmitonQueryOptions } from './@types/marmiton-query-options'
import { Recipe } from './@types/recipe'
import { MarmitonQueryBuilder } from './components/marmiton-query-builder'
import { RECIPE_DIFFICULTY, RECIPE_PRICE, RECIPE_TYPE } from './components/recipe-enums'
import { RecipesParser } from './components/recipes-parser'
export class MarmitonError extends Error {}

const BASE_URL = 'https://www.marmiton.org'
const ENDPOINTS = {
  query: () => `${BASE_URL}/recettes/recherche.aspx`,
}
// Number of recipes per page (this isn't constant)
const RECIPES_PER_PAGE = 13
const DEFAULT_OPTIONS = {
  limit: RECIPES_PER_PAGE,
}

/**
 * Search for recipes within marmiton.com
 * @param qs querystring to use. This can be generated with {@link MarmitonQueryBuilder}
 * @param opt
 */
export async function searchRecipes(
  qs: string,
  ingredients?: string[],  // Ajoutez ce paramètre
  opt?: Partial<MarmitonQueryOptions>
): Promise<Recipe[]> {
  const options = Object.assign(DEFAULT_OPTIONS, opt)
  const recipes: Partial<Recipe>[] = []

  let url = `${ENDPOINTS.query()}?${qs}`;

  // Si des ingrédients sont fournis, modifiez l'URL pour inclure ces ingrédients
  if (ingredients && ingredients.length) {
    const ingredientsQueryString = ingredients.map(ingredient => encodeURIComponent(ingredient)).join('%2C-');
    url += `&aqt=${ingredientsQueryString}`;
  }

  for (let i = 1; recipes.length < options.limit; i++) {
    url += `&page=${i + 1}`
    const request = await fetch(url)
    if (request.status !== 200) break
    const htmlBody = await request.text()
    recipes.push(...(await RecipesParser.parseSearchResults(htmlBody, BASE_URL)))
  }
  return recipes.slice(0, options.limit) as Recipe[]
}

export { MarmitonQueryBuilder, RECIPE_PRICE, RECIPE_DIFFICULTY, RECIPE_TYPE }
export type { MarmitonQueryOptions, Recipe }
