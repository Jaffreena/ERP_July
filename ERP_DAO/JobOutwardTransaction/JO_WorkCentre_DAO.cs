using ERP_DTO;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO
{
    public class JO_WorkCentre_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JO_WorkCentreDB(JO_WorkCentre_DTO JWWC_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JO_WorkCentre_SP");

            Db.AddInParameter(DbC, "@JWWC_Number", DbType.Int64, JWWC_DTO.JWWC_Number);
            Db.AddInParameter(DbC, "@JWWC_JW_WorkCentre", DbType.String, JWWC_DTO.JWWC_JW_WorkCentre);
            Db.AddInParameter(DbC, "@JWWC_Description", DbType.String, JWWC_DTO.JWWC_Description);

            Db.AddInParameter(DbC, "@JWWC_JWCG_Number", DbType.Int64, JWWC_DTO.JWWC_JWCG_Number);
            Db.AddInParameter(DbC, "@JWWC_WH_Number", DbType.Int64, JWWC_DTO.JWWC_WH_Number);
            Db.AddInParameter(DbC, "@JWWC_JPRS_Number", DbType.Int64, JWWC_DTO.JWWC_JPRS_Number);

            Db.AddInParameter(DbC, "@JWWC_DeleteNumbers", DbType.String, JWWC_DTO.JWWC_DeleteNumbers);
            Db.AddInParameter(DbC, "@JWWC_CreatorCode", DbType.Int64, JWWC_DTO.JWWC_CreatorCode);
            Db.AddInParameter(DbC, "@JWWC_Id", DbType.Int32, JWWC_DTO.JWWC_Id);

            DS = Db.ExecuteDataSet(DbC);

            return DS;
        }
    }
}