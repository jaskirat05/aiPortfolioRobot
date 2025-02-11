'use client';

import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import debounce from 'lodash/debounce';

interface ComboboxSelectProps<T> {
  items: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  displayValue: (item: T | null) => string;
  onSearch: (query: string) => Promise<void>;
  name: string;
  children: (item: T) => React.ReactNode;
}

export function ComboboxSelect<T extends { id: string }>({
  items,
  value,
  onChange,
  displayValue,
  onSearch,
  name,
  children
}: ComboboxSelectProps<T>) {
  const [query, setQuery] = useState('');

  const debouncedSearch = debounce((searchQuery: string) => {
    onSearch(searchQuery);
  }, 300);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    debouncedSearch(searchQuery);
  };

  return (
    <div className="relative mt-1">
      <Combobox value={value} onChange={onChange}>
        <input type="hidden" name={name} value={value?.id || ''} />
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-gray-800 text-left focus:outline-none sm:text-sm">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 bg-gray-800 text-gray-300 focus:ring-0"
            displayValue={displayValue}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search..."
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <FiChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {items.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
                Nothing found.
              </div>
            ) : (
              items.map((item) => (
                <Combobox.Option
                  key={item.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-gray-700 text-white' : 'text-gray-300'
                    }`
                  }
                  value={item}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {children(item)}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-indigo-500'
                          }`}
                        >
                          <FiCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
}
