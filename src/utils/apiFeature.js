import {Op} from  'sequelize';

class ApiFeature {
    constructor(model, queryData) {
        this.model = model;
        this.queryData = queryData;
        this.options = {
            where: {},
            include: [],
            order: [],
            attributes: [],
        };
    }

    pagination() {
        let { page, size } = this.queryData;
        
        page = parseInt(page) || 1;
        size = parseInt(size) || 2;

        if (page <= 0) page = 1;
        if (size <= 0) size = 2;

        const offset = (page - 1) * size;

        this.options.limit = size;
        this.options.offset = offset;

        return this;
    }

    sort() {
        if (this.queryData.sort) {
            const sortFields = this.queryData.sort.split(',').map(field => {
                // Check for ascending/descending
                if (field.startsWith('-')) {
                    return [field.slice(1), 'DESC'];
                }
                return [field, 'ASC'];
            });

            this.options.order = sortFields;
        }
        return this;
    }

    select() {
        if (this.queryData.select) {
            const fields = this.queryData.select.split(',');
            this.options.attributes = fields;
        }
        return this;
    }

    filter() {
        // Destructure to remove pagination, sorting, and selection fields
        const { page, size, sort, select, ...filterData } = this.queryData;

        // Create filter object for Sequelize
        const sequelizeFilter = {};

        // Process each filter field
        Object.keys(filterData).forEach(key => {
            // Check for comparison operators
            if (typeof filterData[key] === 'object') {
                const filterOperators = {};

                Object.keys(filterData[key]).forEach(operator => {
                    switch (operator) {
                        case 'gte':
                            filterOperators[Op.gte] = filterData[key][operator];
                            break;
                        case 'gt':
                            filterOperators[Op.gt] = filterData[key][operator];
                            break;
                        case 'lt':
                            filterOperators[Op.lt] = filterData[key][operator];
                            break;
                        case 'lte':
                            filterOperators[Op.lte] = filterData[key][operator];
                            break;
                        case 'ne':
                            filterOperators[Op.ne] = filterData[key][operator];
                            break;
                    }
                });

                sequelizeFilter[key] = filterOperators;
            } else {
                // Simple equality filter
                sequelizeFilter[key] = filterData[key];
            }
        });

        this.options.where = sequelizeFilter;
        return this;
    }

    // Method to execute the query
    async execute() {
        try {
            const result = await this.model.findAndCountAll(this.options);
            
            return {
                count: result.count,
                data: result.rows,
                page: this.queryData.page || 1,
                size: this.queryData.size || 2,
                totalPages: Math.ceil(result.count / (this.queryData.size || 2))
            };
        } catch (error) {
            throw new Error(`Query execution error: ${error.message}`);
        }
    }
}

module.exports = ApiFeature;