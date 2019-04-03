import { Constants } from 'app/shared/utils/constants';

export class TableParamsObject {
  constructor(
    public pageSize: number = Constants.tableDefaults.DEFAULT_PAGE_SIZE,
    public currentPage: number = Constants.tableDefaults.DEFAULT_CURRENT_PAGE,
    public totalListItems: number = 0,
    public sortBy: string = null,
    public sortDirection: number = 0,
    public sortString: string = null
  ) { }
}
