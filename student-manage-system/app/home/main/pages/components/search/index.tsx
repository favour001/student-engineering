"use client"

import React, { useState } from "react"
import { Input, Button, Select, SelectItem, DatePicker } from "@heroui/react"
import { SearchIcon } from "./components/SearchIcon"

export interface SearchFieldConfig {
  name: string
  label: string
  type: "text" | "select" | "date" | "number"
  placeholder?: string
  options?: Array<{ label: string; value: string | number }>
  defaultValue?: any
}

export interface SearchConfig {
  fields: SearchFieldConfig[]
  onSearch: (values: Record<string, any>) => void
  onReset?: () => void
}

export function Search({ fields, onSearch, onReset }: SearchConfig) {
  const [searchValues, setSearchValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue
      }
    })
    return initial
  })

  const handleChange = (name: string, value: any) => {
    setSearchValues(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSearch = () => {
    onSearch(searchValues)
  }

  const handleReset = () => {
    const resetValues: Record<string, any> = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        resetValues[field.name] = field.defaultValue
      }
    })
    setSearchValues(resetValues)
    onReset?.()
  }

  const renderField = (field: SearchFieldConfig) => {
    const commonProps = {
      label: field.label,
      placeholder: field.placeholder || `请输入${field.label}`,
      className: "w-full",
    }

    switch (field.type) {
      case "text":
      case "number":
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={searchValues[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        )

      case "select":
        return (
          <Select
            {...commonProps}
            selectedKeys={searchValues[field.name] ? [String(searchValues[field.name])] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0]
              handleChange(field.name, value)
            }}
          >
            {(field.options || []).map((option) => (
              <SelectItem key={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        )

      case "date":
        return (
          <DatePicker
            {...commonProps}
            value={searchValues[field.name]}
            onChange={(value) => handleChange(field.name, value)}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Filters</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">精准筛选数据</h3>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => (
          <div key={field.name}>
            {renderField(field)}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button
          color="default"
          variant="flat"
          onPress={handleReset}
          className="border border-slate-200 bg-white"
        >
          重置
        </Button>
        <Button
          color="primary"
          startContent={<SearchIcon />}
          onPress={handleSearch}
          className="bg-sky-600 text-white shadow-lg shadow-sky-100"
        >
          搜索
        </Button>
      </div>
    </div>
  )
}
