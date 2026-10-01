using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JO_WorkCentreGroup_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JO_WorkCentreGroupDB(JO_WorkCentreGroup_DTO JWCG_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JO_WorkCentreGroup_SP");

            Int64 Under = Int64.TryParse(JWCG_DTO.JWCG_Under_JWCG_Number, out Int64 U) ? U : 0;

            Db.AddInParameter(DbC, "@JWCG_Number", DbType.Int64, JWCG_DTO.JWCG_Number);
            Db.AddInParameter(DbC, "@JWCG_JW_WorkCentreGroup", DbType.String, JWCG_DTO.JWCG_JW_WorkCentreGroup);
            Db.AddInParameter(DbC, "@JWCG_Description", DbType.String, JWCG_DTO.JWCG_Description);
            Db.AddInParameter(DbC, "@JWCG_Under_JWCG_Number", DbType.Int64, Under);
            Db.AddInParameter(DbC, "@JWCG_DeleteNumbers", DbType.String, JWCG_DTO.JWCG_DeleteNumbers);
            Db.AddInParameter(DbC, "@JWCG_CreatorCode", DbType.Int64, JWCG_DTO.JWCG_CreatorCode);
            Db.AddInParameter(DbC, "@JWCG_Id", DbType.Int32, JWCG_DTO.JWCG_Id);

            DS = Db.ExecuteDataSet(DbC);

            return DS;
        }
    }
}
