const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates category form inputs against backend category schema constraints.
 *
 * @param {object} formData
 * @param {boolean} [isUpdate=false]
 * @returns {{ isValid: boolean, errors: Record<string, string>, parsedPayload?: object }}
 */
export function validateCategoryForm(formData, isUpdate = false) {
  const errors = {};

  // Name validation
  const name = (formData.name || '').trim();
  if (!name && !isUpdate) {
    errors.name = 'Category name is required';
  } else if (name && (name.length < 2 || name.length > 60)) {
    errors.name = 'Category name must be between 2 and 60 characters';
  }

  // Slug validation (optional)
  const slug = (formData.slug || '').trim().toLowerCase();
  if (slug) {
    if (slug.length > 80) {
      errors.slug = 'Slug cannot exceed 80 characters';
    } else if (!SLUG_REGEX.test(slug)) {
      errors.slug = 'Slug must be valid lowercase kebab-case (e.g. streetwear-hoodies)';
    }
  }

  // Description validation (optional)
  const description = (formData.description || '').trim();
  if (description && description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  const isValid = Object.keys(errors).length === 0;

  const parsedPayload = {};
  if (name) parsedPayload.name = name;
  if (slug) parsedPayload.slug = slug;
  if (description !== undefined) parsedPayload.description = description;
  if (typeof formData.isActive === 'boolean') {
    parsedPayload.isActive = formData.isActive;
  } else if (!isUpdate) {
    parsedPayload.isActive = true;
  }

  return {
    isValid,
    errors,
    parsedPayload
  };
}

