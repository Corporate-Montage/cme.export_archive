importPackage(Packages.de.elo.ix.client)
importPackage(Packages.org.apache.commons.io)

//@include lib_Class.js
//@include lib_sol.common.ix.FunctionBase.js

// further includes
//@include lib_sol.common.RepoUtils.js
//@include lib_sol.common.SordUtils.js
//@include lib_sol.common.JsonUtils.js
//@include lib_sol.common.FileUtils.js
/**
 * description
 *
 * @author author, company
 * @version 1.00.000
 *
 * @eloix
 * @requires sol.common.Config
 * @requires sol.common.ConfigMixin
 * @requires sol.common.ObjectUtils.js
 * @requires sol.common.StringUtils.js
 * @requires sol.common.JsonUtils.js
 * @requires sol.common.RepoUtils.js
 * @requires sol.common.WfUtils.js
 * @requires sol.common.ix.RfUtils.js
 * @requires sol.common.ix.FunctionBase
 */

var logger = sol.create('sol.Logger', { scope: 'cmeurope.common.export_entire_archive.ix.functions.Export' })

sol.define('cmeurope.common.export_entire_archive.ix.functions.Export', {
  extend: 'sol.common.ix.FunctionBase',
  myconfig: undefined,

  // you might add required configuration here //
  //requiredConfig: [],

  // configuration section //
  /**
   * @cfg {Type} exampleCfg
   */

  // property section //
  /**
   * @private
   * @property {Type} exampleProperty
   */

  initialize: function (config) {
    var me = this
    me.$super('sol.common.ix.FunctionBase', 'initialize', [config])
    me.myconfig = sol.create('sol.common.Config', {
      compose: '/cmeurope.common.export_entire_archive/Configuration/common.export_entire_archive.config',
    }).config
  },

  /**
   * description
   */
  process: function () {
    var me = this,
      baseDstDirPath,
      entireArchiveSord,
      findInfo,
      findChildren,
      findResult,
      firstLevelSords,
      i,
      sord

    //baseDstDirPath = me.myconfig.baseDstDirPath
    baseDstDirPath = 'E:\\ELOprofessional\\temp'
    logger.info('baseDstDirPath: ' + baseDstDirPath)
    entireArchiveSord = ixConnectAdmin.ix().checkoutSord('1', EditInfoC.mbAll, LockC.NO)
    logger.info('entireArchiveSord: ' + entireArchiveSord)

    findInfo = new FindInfo()

    findChildren = new FindChildren()
    findChildren.parentId = '1'
    findChildren.endLevel = 1
    findChildren.mainParent = true

    findInfo.findChildren = findChildren

    firstLevelSords = ixConnectAdmin.ix().findFirstSords(findInfo, 200, SordC.mbLean).sords

    for (i = 0; i < firstLevelSords.length; i++) {
      sord = firstLevelSords[i]
      logger.info('sord: ' + sord)
      if (!sol.common.SordUtils.isFolder(sord)) {
        logger.info('isDocument')
        sol.common.FileUtils.downloadDocument(sord.id, baseDstDirPath)
      } else if (!String(sord.name).startsWith('Admin')) {
        logger.info('isFolder and does not start with Admin')
        me.walkDirectory(sord, baseDstDirPath)
        sol.common.FileUtils.downloadDocuments(sord.id, baseDstDirPath, { makeDstDirs: true, cleanDstDir: false, includeReferences: true })
      } else {
        continue
      }
    }
  },

  walkDirectory: function (directorySord, windowsPath) {
    var me = this,
      directoryChildrenSords,
      i,
      sord,
      sanitizedFolderName,
      newDirectory;
  
    sanitizedFolderName = me.sanitizeFilename(String(directorySord.name));
  
    newDirectory = new java.io.File(windowsPath + '\\' + sanitizedFolderName);
    if (!newDirectory.exists()) {
      if (newDirectory.mkdirs()) {
        logger.info('Created directory: ' + newDirectory.getAbsolutePath());
      } else {
        logger.error('Failed to create directory: ' + newDirectory.getAbsolutePath());
        return;
      }
    }
  
    directoryChildrenSords = sol.common.RepoUtils.findChildren(directorySord.id, {
      includeFolders: true,
      includeDocuments: true,
      includeReferences: true,
      sordZ: SordC.mbLean,
      level: 1,
    });

    for (i = 0; i < directoryChildrenSords.length; i++) {
      sord = directoryChildrenSords[i];
      if (sol.common.SordUtils.isFolder(sord)) {
        me.walkDirectory(sord, newDirectory.getAbsolutePath());
      } else {
        logger.info('Downloading document: ' + sord.name);
        sol.common.FileUtils.downloadDocument(sord.id, newDirectory.getAbsolutePath());
      }
    }
  },
  

  sanitizeFilename: function (filename) {
    if (!filename) {
      return 'unknown filename';
    }
    return filename.replace(/[\\/:*?"<>|]/g, '_').trim();
  }
})

/**
 * @member cmeurope.common.export_entire_archive.ix.functions.Export
 * @static
 * @inheritdoc sol.common.ix.FunctionBase.onEnterNode
 */
function onEnterNode(ci, userId, wfDiagram, nodeId) {
  logger.enter('onEnterNode_className', { flowId: wfDiagram.id, nodeId: nodeId })
  var config = sol.common.WfUtils.parseAndCheckParams(wfDiagram, nodeId), // you might add required properties here
    module

  // These might be useful in your class //
  //config.objId = wfDiagram.objId;
  //config.ci = ci;
  module = sol.create('cmeurope.common.export_entire_archive.ix.functions.Export', config)

  module.process()

  logger.exit('onEnterNode_className')
}

/**
 * @member cmeurope.common.export_entire_archive.ix.functions.Export
 * @static
 * @inheritdoc sol.common.ix.FunctionBase.onExitNode
 */
function onExitNode(ci, userId, wfDiagram, nodeId) {
  logger.enter('onExitNode_Export', { flowId: wfDiagram.id, nodeId: nodeId })
  var config = sol.common.WfUtils.parseAndCheckParams(wfDiagram, nodeId), // you might add required properties here
    module

  // These might be useful in your class //
  //config.objId = wfDiagram.objId;
  //config.ci = ci;
  module = sol.create('cmeurope.common.export_entire_archive.ix.functions.Export', config)

  module.process()

  logger.exit('onExitNode_Export')
}

/**
 * @member cmeurope.common.export_entire_archive.ix.functions.Export
 * @method RF_cmeurope_common_export_entire_archive_function_Export
 * @static
 * @inheritdoc sol.common.ix.FunctionBase.RF_cmeurope_common_export_entire_archive_function_Export
 */
function RF_cmeurope_common_export_entire_archive_function_Export(ec, configAny) {
  logger.enter('RF_cmeurope_common_export_entire_archive_function_Export ', configAny)
  var rfUtils = sol.common.ix.RfUtils,
    config = rfUtils.parseAndCheckParams(ec, arguments.callee.name, configAny), // you might add required properties here
    module

  // These might be useful in your class //
  //config.ci = ec.ci;
  //config.user = ec.user;

  module = sol.create('cmeurope.common.export_entire_archive.ix.functions.Export', config)
  module.process()

  logger.exit('RF_cmeurope_common_export_entire_archive_function_Export')
}
