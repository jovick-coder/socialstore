'use client'

import { Fragment } from 'react'
import { Attribute, AttributeOption } from '@/config/categories'

interface DynamicAttributesFormProps {
  attributes: Attribute[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
}

export default function DynamicAttributesForm({
  attributes,
  values,
  onChange,
}: DynamicAttributesFormProps) {
  const handleChange = (key: string, value: any) => {
    onChange({
      ...values,
      [key]: value,
    })
  }

  const handleMultiselectToggle = (key: string, optionValue: string) => {
    const current = (values[key] || []) as string[]
    const updated = current.includes(optionValue)
      ? current.filter(v => v !== optionValue)
      : [...current, optionValue]
    handleChange(key, updated)
  }

  const handleToggle = (key: string) => {
    handleChange(key, !values[key])
  }

  if (attributes.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {attributes.map(attribute => (
        <Fragment key={attribute.key}>
          {attribute.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-900">
                {attribute.label}
                {attribute.required && <span className="text-red-500">*</span>}
              </label>
              <select
                value={values[attribute.key] || ''}
                onChange={e => handleChange(attribute.key, e.target.value)}
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select {attribute.label.toLowerCase()}</option>
                {attribute.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {attribute.type === 'multiselect' && (
            <div>
              <label className="block text-sm font-medium text-gray-900">
                {attribute.label}
                {attribute.required && <span className="text-red-500">*</span>}
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {attribute.options?.map(option => {
                  const isSelected = (values[attribute.key] || []).includes(
                    option.value
                  )
                  return (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleMultiselectToggle(attribute.key, option.value)
                      }
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${isSelected
                          ? 'bg-green-100 text-green-900 ring-2 ring-green-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {option.color && (
                        <div
                          className="h-4 w-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {attribute.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-900">
                {attribute.label}
                {attribute.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={values[attribute.key] || ''}
                onChange={e => handleChange(attribute.key, e.target.value)}
                placeholder={attribute.placeholder}
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          )}

          {attribute.type === 'toggle' && (
            <div className="flex items-center justify-between rounded-lg border border-gray-300 px-4 py-3">
              <label className="text-sm font-medium text-gray-900">
                {attribute.label}
              </label>
              <button
                onClick={() => handleToggle(attribute.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${values[attribute.key]
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${values[attribute.key]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          )}

          {attribute.type === 'color' && (
            <div>
              <label className="block text-sm font-medium text-gray-900">
                {attribute.label}
                {attribute.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="color"
                value={values[attribute.key] || '#000000'}
                onChange={e => handleChange(attribute.key, e.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}
