import { Op } from 'sequelize';

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
        this.allowedFields = new Set(Object.keys(model.rawAttributes));
    }

    pagination() {
        let { page, size } = this.queryData;
        page = Math.max(parseInt(page) || 1, 1);
        size = Math.max(parseInt(size) || 10, 1);
        
        this.options.limit = size;
        this.options.offset = (page - 1) * size;
        return this;
    }

    sort() {
        if (this.queryData.sort) {
            const sortFields = this.queryData.sort.split(',').map(field => {
                const [rawField, direction] = field.startsWith('-') 
                    ? [field.slice(1), 'DESC'] 
                    : [field, 'ASC'];
                
                if (!this.allowedFields.has(rawField)) {
                    throw new Error(`Invalid sort field: ${rawField}`);
                }
                
                return [rawField, direction];
            });
            
            this.options.order = sortFields;
        }
        return this;
    }

    select() {
        if (this.queryData.select) {
            const fields = this.queryData.select.split(',');
            const invalidFields = fields.filter(f => !this.allowedFields.has(f));
            
            if (invalidFields.length > 0) {
                throw new Error(`Invalid select fields: ${invalidFields.join(', ')}`);
            }
            
            this.options.attributes = fields;
        }else {
            // Explicitly select all fields if none specified
            this.options.attributes = Object.keys(this.model.rawAttributes);
        }
        return this;
    }

    filter() {
        const { page, size, sort, select, search, ...filterData } = this.queryData;
        
        const sequelizeFilter = Object.entries(filterData).reduce((acc, [key, value]) => {
            if (!this.allowedFields.has(key)) {
                throw new Error(`Invalid filter field: ${key}`);
            }
            
            if (typeof value === 'object') {
                const operators = Object.entries(value).reduce((ops, [op, val]) => {
                    const sequelizeOp = this._getOperator(op);
                    if (!sequelizeOp) throw new Error(`Invalid operator: ${op}`);
                    ops[sequelizeOp] = val;
                    return ops;
                }, {});
                
                acc[key] = operators;
            } else {
                acc[key] = value;
            }
            
            return acc;
        }, {});

        this.options.where = { ...this.options.where, ...sequelizeFilter };
        return this;
    }

    search() {
        if (this.queryData.search) {
            const searchFields = ['title', 'description'];
            const keyword = `%${this.queryData.search.trim()}%`;
            
            this.options.where = {
                ...this.options.where,
                [Op.or]: searchFields.map(field => ({
                    [field]: { [Op.iLike]: keyword }
                }))
            };
        }
        return this;
    }

    async execute() {
        try {
            const result = await this.model.findAndCountAll(this.options);
            return {
                count: result.count,
                data: result.rows,
                page: parseInt(this.queryData.page) || 1,
                size: parseInt(this.queryData.size) || 10,
                totalPages: Math.ceil(result.count / (parseInt(this.queryData.size) || 10))
            };
        } catch (error) {
            throw new Error(`Query failed: ${error.message}`);
        }
    }

    _getOperator(op) {
        const operatorMap = {
            gte: Op.gte,
            gt: Op.gt,
            lt: Op.lt,
            lte: Op.lte,
            ne: Op.ne
        };
        return operatorMap[op];
    }
}

export { ApiFeature };