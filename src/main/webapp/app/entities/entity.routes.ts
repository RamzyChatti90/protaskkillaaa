import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'protaskkillaaaApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'task',
    data: { pageTitle: 'protaskkillaaaApp.task.home.title' },
    loadChildren: () => import('./task/task.routes'),
  },
  {
    path: 'category',
    data: { pageTitle: 'protaskkillaaaApp.category.home.title' },
    loadChildren: () => import('./category/category.routes'),
  },
  {
    path: 'comment',
    data: { pageTitle: 'protaskkillaaaApp.comment.home.title' },
    loadChildren: () => import('./comment/comment.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
