import * as migration_20250821_183907_initial from './20250821_183907_initial'
import * as migration_20250826_104125 from './20250826_104125'

export const migrations = [
  {
    up: migration_20250821_183907_initial.up,
    down: migration_20250821_183907_initial.down,
    name: '20250821_183907_initial',
  },
  {
    up: migration_20250826_104125.up,
    down: migration_20250826_104125.down,
    name: '20250826_104125',
  },
]
