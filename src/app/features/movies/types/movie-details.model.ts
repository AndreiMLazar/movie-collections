import type { Movie } from './movie.model';

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface MovieCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  tagline: string;
  homepage: string;
  budget: number;
  revenue: number;
  genres: { id: number; name: string }[];
  credits: MovieCredits;
}
