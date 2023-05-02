import { ApplicationError } from '@/protocols';

export function cannotFindRoom(): ApplicationError {
  return {
    name: 'CannotFindRoom',
    message: 'Cannot find room!',
  };
}
