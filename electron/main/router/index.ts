import dialogRoutes from '../routes/dialog';
import recordRoutes from '../routes/record';
import segmentsRoutes from '../routes/segments';

export const routers = {
  dialog: () => dialogRoutes,
  record: () => recordRoutes,
  segments: () => segmentsRoutes
};

type Routers = typeof routers;

export type Resolvers = {
  [Router in keyof Routers]: Awaited<ReturnType<Routers[Router]>>['resolvers'];
};

// export { fetch } from './fetch'
