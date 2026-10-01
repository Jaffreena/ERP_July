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
    public class JO_Process_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JO_ProcessDB(JO_Process_DTO JPRS_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JO_Process_SP");

            Db.AddInParameter(DbC, "@JPRS_Number", DbType.Int64, JPRS_DTO.JPRS_Number);
            Db.AddInParameter(DbC, "@JPRS_ProcessName", DbType.String, JPRS_DTO.JPRS_ProcessName);
            Db.AddInParameter(DbC, "@JPRS_Description", DbType.String, JPRS_DTO.JPRS_Description);

            Db.AddInParameter(DbC, "@JPRS_Cons_UoM_Number", DbType.Int64, JPRS_DTO.JPRS_Cons_UoM_Number);
            Db.AddInParameter(DbC, "@JPRS_Prod_UoM_Number", DbType.Int64, JPRS_DTO.JPRS_Prod_UoM_Number);
            Db.AddInParameter(DbC, "@JPRS_Scrap_UoM_Number", DbType.Int64, JPRS_DTO.JPRS_Scrap_UoM_Number);
            Db.AddInParameter(DbC, "@JPRS_Item_Number", DbType.Int64, JPRS_DTO.JPRS_Item_Number);
            Db.AddInParameter(DbC, "@JPRS_SAC_Number", DbType.Int64, JPRS_DTO.JPRS_SAC_Number);

            Db.AddInParameter(DbC, "@JPRS_DeleteNumbers", DbType.String, JPRS_DTO.JPRS_DeleteNumbers);
            Db.AddInParameter(DbC, "@JPRS_CreatorCode", DbType.Int64, JPRS_DTO.JPRS_CreatorCode);
            Db.AddInParameter(DbC, "@JPRS_Id", DbType.Int32, JPRS_DTO.JPRS_Id);

            DS = Db.ExecuteDataSet(DbC);

            return DS;
        }
    }
}
